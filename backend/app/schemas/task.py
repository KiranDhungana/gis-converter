from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class OutputFormat(str, Enum):
    GEOJSON = "geojson"
    SHAPEFILE = "shapefile"
    KML = "kml"
    GPKG = "gpkg"
    CSV = "csv"
    GEOTIFF = "geotiff"
    COG = "cog"


class InputFormat(str, Enum):
    GEOJSON = "geojson"
    SHAPEFILE = "shapefile"
    KML = "kml"
    GPKG = "gpkg"
    CSV = "csv"
    GEOTIFF = "geotiff"
    COG = "cog"


class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ConversionParams(BaseModel):
    """Optional conversion parameters (raster + tabular controls)."""

    resolution: float | None = Field(
        default=None,
        gt=0,
        description="Pixel size (in target CRS units) for rasterizing vector data.",
    )
    bands: str | None = Field(
        default=None,
        description="Comma-separated 1-based band indexes to keep, e.g. '1,2,3'.",
        examples=["1", "1,2,3"],
    )
    nodata: float | None = Field(
        default=None, description="NoData value for raster output / fill value when rasterizing."
    )
    attribute: str | None = Field(
        default=None,
        description="Vector attribute to burn into raster cells when rasterizing.",
    )
    all_touched: bool = Field(
        default=False,
        description="Burn all pixels touched by geometries (rasterization).",
    )
    ignore_zero: bool = Field(
        default=False,
        description="Treat 0 as background when vectorizing a raster mask.",
    )

    def to_engine_dict(self) -> dict:
        return self.model_dump(exclude_none=True)


class ConversionConfig(BaseModel):
    output_format: OutputFormat
    target_crs: str | None = Field(
        default=None,
        description="EPSG code for reprojection, e.g. 'EPSG:4326'",
        examples=["EPSG:4326", "EPSG:3857"],
    )
    params: ConversionParams = Field(default_factory=ConversionParams)


class UploadResponse(BaseModel):
    task_id: UUID
    input_filename: str
    input_format: str
    status: TaskStatus
    message: str = "File uploaded. Conversion queued."


class TaskResponse(BaseModel):
    id: UUID
    input_filename: str
    input_format: str
    output_format: str
    output_filename: str | None = None
    output_size_bytes: int | None = None
    progress_percent: int = 0
    target_crs: str | None
    conversion_params: str | None = None
    status: TaskStatus
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int


class DownloadResponse(BaseModel):
    task_id: UUID
    download_url: str
    output_format: str
    output_filename: str | None = None
    output_size_bytes: int | None = None
    expires_in: int = 3600


class SupportedFormat(BaseModel):
    name: str
    extensions: list[str]
    kind: str = "vector"
    can_read: bool
    can_write: bool


class FormatsResponse(BaseModel):
    formats: list[SupportedFormat]
