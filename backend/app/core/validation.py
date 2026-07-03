import json
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings, get_settings

_GEOJSON_GEOMETRY_TYPES = {
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection",
}


def validate_upload(file: UploadFile, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    filename = file.filename or "upload"
    ext = Path(filename).suffix.lower()

    if ext not in settings.allowed_input_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed: {settings.allowed_input_extensions}",
        )

    return filename


async def validate_upload_size(file: UploadFile, settings: Settings | None = None) -> bytes:
    settings = settings or get_settings()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    data = await file.read()

    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.max_upload_size_mb} MB",
        )

    return data


def detect_format(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    mapping = {
        ".geojson": "geojson",
        ".json": "geojson",
        ".zip": "shapefile",
        ".shp": "shapefile",
        ".kml": "kml",
        ".gpkg": "gpkg",
        ".csv": "csv",
        ".tif": "geotiff",
        ".tiff": "geotiff",
    }
    fmt = mapping.get(ext)
    if not fmt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot detect format for extension '{ext}'",
        )
    return fmt


def _validate_geometry(geometry: dict, path: str = "geometry") -> None:
    if not isinstance(geometry, dict):
        raise ValueError(f"{path} must be an object")
    gtype = geometry.get("type")
    if gtype not in _GEOJSON_GEOMETRY_TYPES:
        raise ValueError(f"{path} has invalid geometry type '{gtype}'")
    if gtype == "GeometryCollection":
        geometries = geometry.get("geometries")
        if not isinstance(geometries, list):
            raise ValueError(f"{path}.geometries must be an array")
        for i, g in enumerate(geometries):
            _validate_geometry(g, f"{path}.geometries[{i}]")
    else:
        if "coordinates" not in geometry:
            raise ValueError(f"{path} is missing 'coordinates'")
        if not isinstance(geometry["coordinates"], list):
            raise ValueError(f"{path}.coordinates must be an array")


def validate_geojson_rfc7946(data: bytes) -> None:
    """Lightweight RFC 7946 structural validation for GeoJSON uploads."""
    try:
        obj = json.loads(data)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON: {exc.msg} (line {exc.lineno}, column {exc.colno})",
        )

    if not isinstance(obj, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GeoJSON root must be a JSON object",
        )

    gtype = obj.get("type")
    try:
        if gtype == "FeatureCollection":
            features = obj.get("features")
            if not isinstance(features, list):
                raise ValueError("FeatureCollection.features must be an array")
            for i, feature in enumerate(features):
                if not isinstance(feature, dict) or feature.get("type") != "Feature":
                    raise ValueError(f"features[{i}] must be a Feature object")
                geom = feature.get("geometry")
                if geom is not None:
                    _validate_geometry(geom, f"features[{i}].geometry")
        elif gtype == "Feature":
            geom = obj.get("geometry")
            if geom is not None:
                _validate_geometry(geom)
        elif gtype in _GEOJSON_GEOMETRY_TYPES:
            _validate_geometry(obj)
        else:
            raise ValueError(
                f"Invalid GeoJSON 'type': '{gtype}'. Expected FeatureCollection, Feature, or a geometry."
            )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid GeoJSON: {exc}")


def validate_geotiff(data: bytes) -> dict:
    """Validate GeoTIFF integrity and return CRS / dimension metadata."""
    import rasterio
    from rasterio.io import MemoryFile

    try:
        with MemoryFile(data) as memfile:
            with memfile.open() as src:
                return {
                    "crs": str(src.crs) if src.crs else None,
                    "width": src.width,
                    "height": src.height,
                    "band_count": src.count,
                    "dtype": src.dtypes[0] if src.dtypes else None,
                    "nodata": src.nodata,
                }
    except Exception as exc:  # rasterio raises various errors for corrupt files
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupt GeoTIFF: {exc}",
        )


def validate_content(data: bytes, input_format: str) -> dict | None:
    """Run format-specific content validation. Returns optional metadata."""
    if input_format == "geojson":
        validate_geojson_rfc7946(data)
        return None
    if input_format == "geotiff":
        return validate_geotiff(data)
    return None
