import json
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.auth import get_current_subject
from app.core.openapi import OPENAPI_RESPONSES
from app.core.storage import StorageClient, get_storage_client
from app.core.validation import (
    detect_format,
    validate_content,
    validate_upload,
    validate_upload_size,
)
from app.db.models import ConversionTask, TaskStatus
from app.db.session import get_db
from app.schemas.task import (
    ConversionConfig,
    ConversionParams,
    InputFormat,
    OutputFormat,
    TaskStatus as TaskStatusSchema,
    UploadResponse,
)
from app.workers.tasks import run_conversion

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post(
    "",
    response_model=UploadResponse,
    status_code=201,
    summary="Upload file and queue conversion",
    description=(
        "Upload a GIS file and start an asynchronous conversion. "
        "Returns a task ID to poll via `GET /api/v1/tasks/{task_id}`."
    ),
    responses={
        400: {"description": "Unsupported file type or invalid content"},
        401: OPENAPI_RESPONSES[401],
        413: {"description": "File exceeds maximum upload size (100 MB)"},
        422: {"description": "Missing or invalid form fields"},
    },
)
async def upload_file(
    file: Annotated[UploadFile, File(description="Input GIS file (max 100 MB)")],
    output_format: Annotated[
        OutputFormat, Form(description="Target format: geojson, shapefile, kml, gpkg, csv, geotiff, cog")
    ],
    input_format: Annotated[
        InputFormat | None, Form(description="Override auto-detected input format")
    ] = None,
    target_crs: Annotated[
        str | None, Form(description="Reproject to EPSG code, e.g. EPSG:4326")
    ] = None,
    resolution: Annotated[
        float | None, Form(description="Pixel size (CRS units) when rasterizing vectors")
    ] = None,
    bands: Annotated[
        str | None, Form(description="Comma-separated 1-based band indexes, e.g. 1,2,3")
    ] = None,
    nodata: Annotated[float | None, Form(description="NoData / fill value for raster output")] = None,
    attribute: Annotated[
        str | None, Form(description="Vector attribute to burn when rasterizing")
    ] = None,
    all_touched: Annotated[
        bool, Form(description="Burn all pixels touched by geometries when rasterizing")
    ] = False,
    ignore_zero: Annotated[
        bool, Form(description="Treat 0 as background when vectorizing a raster")
    ] = False,
    owner_id: str = Depends(get_current_subject),
    db: Session = Depends(get_db),
    storage: StorageClient = Depends(get_storage_client),
) -> UploadResponse:
    filename = validate_upload(file)
    data = await validate_upload_size(file)
    resolved_input_format = input_format.value if input_format else detect_format(filename)
    validate_content(data, resolved_input_format)

    params = ConversionParams(
        resolution=resolution,
        bands=bands,
        nodata=nodata,
        attribute=attribute,
        all_touched=all_touched,
        ignore_zero=ignore_zero,
    )
    config = ConversionConfig(output_format=output_format, target_crs=target_crs, params=params)
    engine_params = config.params.to_engine_dict()

    storage_key = storage.upload_bytes(data, filename, prefix="uploads")

    task = ConversionTask(
        input_filename=filename,
        input_format=resolved_input_format,
        input_storage_key=storage_key,
        output_format=config.output_format.value,
        target_crs=config.target_crs,
        conversion_params=json.dumps(engine_params) if engine_params else None,
        status=TaskStatus.PENDING,
        user_id=owner_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    run_conversion.delay(str(task.id))

    return UploadResponse(
        task_id=task.id,
        input_filename=task.input_filename,
        input_format=task.input_format,
        status=TaskStatusSchema(task.status.value),
    )
