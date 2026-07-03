"""Raster conversion helpers."""
from __future__ import annotations

import math
import tempfile
from pathlib import Path
from typing import Any

import geopandas as gpd
import numpy as np
import rasterio
from rasterio.features import rasterize as rio_rasterize
from rasterio.features import shapes as rio_shapes
from rasterio.transform import from_bounds
from rasterio.warp import Resampling, calculate_default_transform, reproject

from app.converters.vector import read_vector, write_vector

_DEFAULT_GRID_DIM = 1024


def _parse_bands(params: dict[str, Any]) -> list[int] | None:
    bands = params.get("bands")
    if not bands:
        return None
    if isinstance(bands, str):
        bands = [int(b) for b in bands.replace(" ", "").split(",") if b]
    return [int(b) for b in bands] or None


def _reproject_raster(src_path: Path, dst_path: Path, dst_crs: str) -> None:
    with rasterio.open(src_path) as src:
        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds
        )
        profile = src.profile.copy()
        profile.update(crs=dst_crs, transform=transform, width=width, height=height)
        with rasterio.open(dst_path, "w", **profile) as dst:
            for i in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, i),
                    destination=rasterio.band(dst, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=dst_crs,
                    resampling=Resampling.nearest,
                )


def _write_geotiff_subset(src_path: Path, dst_path: Path, bands: list[int] | None) -> None:
    with rasterio.open(src_path) as src:
        indexes = bands or list(range(1, src.count + 1))
        data = src.read(indexes)
        profile = src.profile.copy()
        profile.update(count=len(indexes), driver="GTiff")
        with rasterio.open(dst_path, "w", **profile) as dst:
            dst.write(data)


def raster_to_raster(
    input_path: Path,
    output_path: Path,
    output_format: str,
    target_crs: str | None,
    params: dict[str, Any],
) -> None:
    bands = _parse_bands(params)
    nodata = params.get("nodata")

    with tempfile.TemporaryDirectory() as tmpdir:
        src_path = input_path
        if target_crs:
            reprojected = Path(tmpdir) / "reprojected.tif"
            _reproject_raster(input_path, reprojected, target_crs)
            src_path = reprojected

        if output_format == "cog":
            from rio_cogeo.cogeo import cog_translate
            from rio_cogeo.profiles import cog_profiles

            profile = cog_profiles.get("deflate")
            cog_translate(
                str(src_path),
                str(output_path),
                profile,
                indexes=bands,
                nodata=nodata,
                in_memory=False,
                quiet=True,
            )
        else:  # plain geotiff (optional reprojection / band extraction)
            _write_geotiff_subset(src_path, output_path, bands)


def polygonize_raster(
    input_path: Path,
    output_path: Path,
    output_format: str,
    driver: str | None,
    target_crs: str | None,
    params: dict[str, Any],
) -> None:
    """Vectorize a raster band into polygons (one feature per connected value region)."""
    bands = _parse_bands(params)
    band_index = bands[0] if bands else 1

    with rasterio.open(input_path) as src:
        band = src.read(band_index)
        crs = src.crs
        transform = src.transform

        nodata = params.get("nodata", src.nodata)
        if params.get("ignore_zero"):
            mask = band != 0
        elif nodata is not None:
            mask = band != nodata
        else:
            mask = src.dataset_mask().astype(bool)

        if band.dtype == np.float64:
            band = band.astype(np.float32)

        features = [
            {"type": "Feature", "properties": {"value": value}, "geometry": geom}
            for geom, value in rio_shapes(band, mask=mask, transform=transform)
        ]

    if not features:
        raise ValueError("No vector features could be extracted from the raster.")

    gdf = gpd.GeoDataFrame.from_features(features, crs=crs)
    if target_crs:
        gdf = gdf.to_crs(target_crs)
    write_vector(gdf, output_path, output_format, driver)


def rasterize_vector(
    input_path: Path,
    output_path: Path,
    input_format: str,
    output_format: str,
    target_crs: str | None,
    params: dict[str, Any],
) -> None:
    """Burn vector geometries into a raster grid."""
    gdf = read_vector(input_path, input_format, params)
    if target_crs:
        gdf = gdf.to_crs(target_crs)
    if gdf.crs is None:
        gdf = gdf.set_crs("EPSG:4326")

    minx, miny, maxx, maxy = gdf.total_bounds
    if not all(math.isfinite(v) for v in (minx, miny, maxx, maxy)):
        raise ValueError("Vector layer has no valid extent to rasterize.")

    resolution = params.get("resolution")
    if resolution:
        resolution = float(resolution)
        width = max(1, int(math.ceil((maxx - minx) / resolution)))
        height = max(1, int(math.ceil((maxy - miny) / resolution)))
    else:
        span = max(maxx - minx, maxy - miny) or 1.0
        resolution = span / _DEFAULT_GRID_DIM
        width = max(1, int(math.ceil((maxx - minx) / resolution)))
        height = max(1, int(math.ceil((maxy - miny) / resolution)))

    transform = from_bounds(minx, miny, maxx, maxy, width, height)
    all_touched = bool(params.get("all_touched", False))
    nodata = params.get("nodata", 0)
    attribute = params.get("attribute")

    if attribute and attribute in gdf.columns:
        values = gdf[attribute]
        shapes_iter = list(zip(gdf.geometry, values))
        dtype = "float32" if values.dtype.kind == "f" else "int32"
    else:
        burn_value = params.get("burn_value", 255)
        shapes_iter = [(geom, burn_value) for geom in gdf.geometry]
        dtype = "float32" if isinstance(burn_value, float) else "uint8"

    array = rio_rasterize(
        shapes_iter,
        out_shape=(height, width),
        transform=transform,
        fill=nodata,
        all_touched=all_touched,
        dtype=dtype,
    )

    profile = {
        "driver": "GTiff",
        "height": height,
        "width": width,
        "count": 1,
        "dtype": dtype,
        "crs": gdf.crs.to_string(),
        "transform": transform,
        "nodata": nodata,
    }

    if output_format == "cog":
        from rio_cogeo.cogeo import cog_translate
        from rio_cogeo.profiles import cog_profiles

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_tif = Path(tmpdir) / "rasterized.tif"
            with rasterio.open(tmp_tif, "w", **profile) as dst:
                dst.write(array, 1)
            cog_translate(
                str(tmp_tif),
                str(output_path),
                cog_profiles.get("deflate"),
                in_memory=False,
                quiet=True,
            )
    else:
        with rasterio.open(output_path, "w", **profile) as dst:
            dst.write(array, 1)
