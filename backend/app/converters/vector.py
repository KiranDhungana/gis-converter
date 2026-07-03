"""Vector conversion helpers."""
from __future__ import annotations

import shutil
import tempfile
import zipfile
from pathlib import Path
from typing import Any

import geopandas as gpd
import pandas as pd
from shapely import wkt
from shapely.geometry import Point

_WKT_CANDIDATES = ("geometry", "wkt", "geom", "the_geom")
_LON_CANDIDATES = ("longitude", "lon", "lng", "long", "x")
_LAT_CANDIDATES = ("latitude", "lat", "y")

DEFAULT_CSV_CRS = "EPSG:4326"


def _find_column(columns: list[str], candidates: tuple[str, ...]) -> str | None:
    lowered = {c.lower(): c for c in columns}
    for cand in candidates:
        if cand in lowered:
            return lowered[cand]
    return None


def read_csv_as_gdf(input_path: Path, params: dict[str, Any]) -> gpd.GeoDataFrame:
    """Build a GeoDataFrame from a CSV with either a WKT column or lat/lon columns."""
    df = pd.read_csv(input_path)
    columns = list(df.columns)

    wkt_col = params.get("geometry_column") or _find_column(columns, _WKT_CANDIDATES)
    lon_col = params.get("lon_column") or _find_column(columns, _LON_CANDIDATES)
    lat_col = params.get("lat_column") or _find_column(columns, _LAT_CANDIDATES)
    src_crs = params.get("source_crs") or DEFAULT_CSV_CRS

    if wkt_col and wkt_col in df.columns:
        geometry = df[wkt_col].apply(lambda v: wkt.loads(v) if isinstance(v, str) and v.strip() else None)
        df = df.drop(columns=[wkt_col])
        return gpd.GeoDataFrame(df, geometry=geometry, crs=src_crs)

    if lon_col and lat_col:
        geometry = [
            Point(xy) if pd.notna(xy[0]) and pd.notna(xy[1]) else None
            for xy in zip(df[lon_col], df[lat_col])
        ]
        return gpd.GeoDataFrame(df, geometry=geometry, crs=src_crs)

    raise ValueError(
        "CSV must contain a WKT geometry column (e.g. 'geometry') or "
        "longitude/latitude columns (e.g. 'lon'/'lat')."
    )


def read_vector(input_path: Path, input_format: str, params: dict[str, Any]) -> gpd.GeoDataFrame:
    if input_format == "csv":
        return read_csv_as_gdf(input_path, params)
    return gpd.read_file(input_path)


def _write_csv(gdf: gpd.GeoDataFrame, output_path: Path) -> None:
    geom_name = gdf.geometry.name
    df = pd.DataFrame(gdf.drop(columns=[geom_name]))
    df["geometry"] = gdf.geometry.apply(lambda g: g.wkt if g is not None else None)
    if not gdf.geometry.empty and (gdf.geom_type == "Point").all():
        df["longitude"] = gdf.geometry.x
        df["latitude"] = gdf.geometry.y
    df.to_csv(output_path, index=False)


def _write_shapefile_zip(gdf: gpd.GeoDataFrame, output_path: Path) -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        shp_dir = Path(tmpdir) / "shapefile"
        shp_dir.mkdir()
        gdf.to_file(shp_dir / "output.shp", driver="ESRI Shapefile")
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in shp_dir.glob("output.*"):
                zf.write(f, f.name)


def write_vector(gdf: gpd.GeoDataFrame, output_path: Path, output_format: str, driver: str | None) -> None:
    if output_format == "csv":
        _write_csv(gdf, output_path)
        return
    if output_format == "shapefile":
        _write_shapefile_zip(gdf, output_path)
        return
    gdf.to_file(output_path, driver=driver)


def vector_to_vector(
    input_path: Path,
    output_path: Path,
    input_format: str,
    output_format: str,
    driver: str | None,
    target_crs: str | None,
    params: dict[str, Any],
) -> None:
    gdf = read_vector(input_path, input_format, params)
    if target_crs:
        gdf = gdf.to_crs(target_crs)
    write_vector(gdf, output_path, output_format, driver)
