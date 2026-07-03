from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import apply_task_owner_filter, get_current_subject, verify_task_access
from app.core.openapi import OPENAPI_RESPONSES
from app.core.storage import StorageClient, get_storage_client
from app.db.models import ConversionTask, TaskStatus
from app.db.session import get_db
from app.schemas.task import TaskListResponse, TaskResponse, TaskStatus as TaskStatusSchema

router = APIRouter(prefix="/tasks", tags=["tasks"])

OUTPUT_CONTENT_TYPES = {
    "geojson": "application/geo+json",
    "geotiff": "image/tiff",
    "cog": "image/tiff",
    "csv": "text/csv",
    "kml": "application/vnd.google-earth.kml+xml",
    "gpkg": "application/geopackage+sqlite3",
    "shapefile": "application/zip",
}


def _to_response(task: ConversionTask) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        input_filename=task.input_filename,
        input_format=task.input_format,
        output_format=task.output_format,
        output_filename=task.output_filename,
        output_size_bytes=task.output_size_bytes,
        progress_percent=task.progress_percent or 0,
        target_crs=task.target_crs,
        conversion_params=task.conversion_params,
        status=TaskStatusSchema(task.status.value),
        error_message=task.error_message,
        created_at=task.created_at,
        updated_at=task.updated_at,
        completed_at=task.completed_at,
    )


@router.get(
    "",
    response_model=TaskListResponse,
    summary="List conversion tasks",
    description="Returns tasks owned by the JWT subject, newest first.",
    responses={401: OPENAPI_RESPONSES[401]},
)
def list_tasks(
    skip: Annotated[int, Query(ge=0, description="Pagination offset")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Page size (max 100)")] = 20,
    status_filter: Annotated[
        TaskStatusSchema | None, Query(alias="status", description="Filter by task status")
    ] = None,
    owner_id: str = Depends(get_current_subject),
    db: Session = Depends(get_db),
) -> TaskListResponse:
    query = select(ConversionTask)
    count_query = select(func.count()).select_from(ConversionTask)

    query = apply_task_owner_filter(query, owner_id)
    count_query = apply_task_owner_filter(count_query, owner_id)

    if status_filter:
        db_status = TaskStatus(status_filter.value)
        query = query.where(ConversionTask.status == db_status)
        count_query = count_query.where(ConversionTask.status == db_status)

    total = db.scalar(count_query) or 0
    tasks = db.scalars(query.order_by(ConversionTask.created_at.desc()).offset(skip).limit(limit)).all()

    return TaskListResponse(tasks=[_to_response(t) for t in tasks], total=total)


@router.get(
    "/{task_id}/content",
    summary="Download converted file (direct)",
    description="Stream the completed output through the API. Returns 409 if the task is not finished.",
    responses={
        401: OPENAPI_RESPONSES[401],
        404: OPENAPI_RESPONSES[404],
        409: OPENAPI_RESPONSES[409],
    },
)
def get_task_content(
    task_id: UUID,
    owner_id: str = Depends(get_current_subject),
    db: Session = Depends(get_db),
    storage: StorageClient = Depends(get_storage_client),
) -> Response:
    task = db.get(ConversionTask, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    verify_task_access(task, owner_id)

    if task.status != TaskStatus.COMPLETED or not task.output_storage_key:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task output is not ready (status: {task.status.value})",
        )

    data = storage.download_bytes(task.output_storage_key)
    media_type = OUTPUT_CONTENT_TYPES.get(task.output_format, "application/octet-stream")
    return Response(content=data, media_type=media_type)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task status",
    description="Poll conversion progress until `status` is `completed` or `failed`.",
    responses={401: OPENAPI_RESPONSES[401], 404: OPENAPI_RESPONSES[404]},
)
def get_task(
    task_id: UUID,
    owner_id: str = Depends(get_current_subject),
    db: Session = Depends(get_db),
) -> TaskResponse:
    task = db.get(ConversionTask, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    verify_task_access(task, owner_id)
    return _to_response(task)
