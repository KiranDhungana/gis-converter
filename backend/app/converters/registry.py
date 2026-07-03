from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.converters import raster as raster_ops
from app.converters import vector as vector_ops

DRIVER_MAP: dict[str, dict[str, str | None]] = {
    "geojson": {"driver": "GeoJSON", "ext": ".geojson"},
    "shapefile": {"driver": "ESRI Shapefile", "ext": ".zip"},
    "kml": {"driver": "KML", "ext": ".kml"},
    "gpkg": {"driver": "GPKG", "ext": ".gpkg"},
    "csv": {"driver": None, "ext": ".csv"},
    "geotiff": {"driver": "GTiff", "ext": ".tif"},
    "cog": {"driver": "COG", "ext": ".tif"},
}

VECTOR_FORMATS = {"geojson", "shapefile", "kml", "gpkg", "csv"}
RASTER_FORMATS = {"geotiff", "cog"}


@dataclass(frozen=True)
class FormatInfo:
    name: str
    extensions: list[str]
    kind: str = "vector"
    can_read: bool = True
    can_write: bool = True


FORMAT_INFO: list[FormatInfo] = [
    FormatInfo("geojson", [".geojson", ".json"], kind="vector"),
    FormatInfo("shapefile", [".zip", ".shp"], kind="vector"),
    FormatInfo("kml", [".kml"], kind="vector"),
    FormatInfo("gpkg", [".gpkg"], kind="vector"),
    FormatInfo("csv", [".csv"], kind="vector"),
    FormatInfo("geotiff", [".tif", ".tiff"], kind="raster"),
    FormatInfo("cog", [".tif"], kind="raster"),
]


def list_formats() -> list[FormatInfo]:
    return FORMAT_INFO


def _kind(fmt: str) -> str:
    return "raster" if fmt in RASTER_FORMATS else "vector"


def convert(
    input_path: Path,
    output_path: Path,
    input_format: str,
    output_format: str,
    target_crs: str | None = None,
    params: dict[str, Any] | None = None,
) -> None:
    if input_format not in DRIVER_MAP:
        raise ValueError(f"Unsupported input format: {input_format}")
    if output_format not in DRIVER_MAP:
        raise ValueError(f"Unsupported output format: {output_format}")

    params = params or {}
    driver = DRIVER_MAP[output_format]["driver"]
    in_kind = _kind(input_format)
    out_kind = _kind(output_format)

    if in_kind == "vector" and out_kind == "vector":
        vector_ops.vector_to_vector(
            input_path, output_path, input_format, output_format, driver, target_crs, params
        )
    elif in_kind == "vector" and out_kind == "raster":
        raster_ops.rasterize_vector(
            input_path, output_path, input_format, output_format, target_crs, params
        )
    elif in_kind == "raster" and out_kind == "vector":
        raster_ops.polygonize_raster(
            input_path, output_path, output_format, driver, target_crs, params
        )
    else:  # raster -> raster (GeoTIFF -> COG, reprojection, band extraction)
        raster_ops.raster_to_raster(input_path, output_path, output_format, target_crs, params)


def output_extension(output_format: str) -> str:
    return DRIVER_MAP[output_format]["ext"]
