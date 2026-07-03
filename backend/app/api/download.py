from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.converters.registry import list_formats
from app.core.auth import get_current_subject, verify_task_access
from app.core.openapi import OPENAPI_RESPONSES
from app.core.storage import StorageClient, get_storage_client
from app.db.models import ConversionTask, TaskStatus
from app.db.session import get_db
from app.schemas.task import DownloadResponse, FormatsResponse, SupportedFormat

router = APIRouter(tags=["download"])


@router.get(
    "/download/{task_id}",
    response_model=DownloadResponse,
    summary="Get presigned download URL",
    description=(
        "Returns a temporary MinIO URL (valid 1 hour) for the converted file. "
        "Requires the task to be `completed`."
    ),
    responses={
        401: OPENAPI_RESPONSES[401],
        404: OPENAPI_RESPONSES[404],
        409: OPENAPI_RESPONSES[409],
    },
)
def download_result(
    task_id: UUID,
    owner_id: str = Depends(get_current_subject),
    db: Session = Depends(get_db),
    storage: StorageClient = Depends(get_storage_client),
) -> DownloadResponse:
    task = db.get(ConversionTask, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    verify_task_access(task, owner_id)

    if task.status != TaskStatus.COMPLETED or not task.output_storage_key:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task is not ready for download (status: {task.status.value})",
        )

    expires_in = 3600
    download_filename = task.output_filename or task.output_storage_key.split("/")[-1]
    url = storage.presigned_url(
        task.output_storage_key,
        expires_in=expires_in,
        download_filename=download_filename,
    )

    return DownloadResponse(
        task_id=task.id,
        download_url=url,
        output_format=task.output_format,
        output_filename=task.output_filename,
        output_size_bytes=task.output_size_bytes,
        expires_in=expires_in,
    )


@router.get(
    "/formats",
    response_model=FormatsResponse,
    summary="List supported formats",
    description="Returns all input/output formats supported by the conversion engine. No authentication required.",
)
def get_supported_formats() -> FormatsResponse:
    formats = [
        SupportedFormat(
            name=f.name,
            extensions=f.extensions,
            kind=f.kind,
            can_read=f.can_read,
            can_write=f.can_write,
        )
        for f in list_formats()
    ]
    return FormatsResponse(formats=formats)
