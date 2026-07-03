import json
import tempfile
import traceback
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

from app.converters.registry import convert, output_extension
from app.core.storage import StorageClient
from app.db.models import ConversionTask, TaskStatus
from app.db.session import SessionLocal
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="app.workers.tasks.run_conversion", max_retries=2)
def run_conversion(self, task_id: str) -> dict:
    db = SessionLocal()
    storage = StorageClient()

    try:
        task = db.get(ConversionTask, UUID(task_id))
        if not task:
            return {"error": f"Task {task_id} not found"}

        task.status = TaskStatus.PROCESSING
        task.celery_task_id = self.request.id
        task.progress_percent = 10
        db.commit()

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            input_path = tmp / task.input_filename
            out_ext = output_extension(task.output_format)
            output_filename = f"{Path(task.input_filename).stem}_converted{out_ext}"
            output_path = tmp / output_filename

            params = json.loads(task.conversion_params) if task.conversion_params else {}

            storage.download_to_path(task.input_storage_key, str(input_path))
            task.progress_percent = 35
            db.commit()

            convert(
                input_path=input_path,
                output_path=output_path,
                input_format=task.input_format,
                output_format=task.output_format,
                target_crs=task.target_crs,
                params=params,
            )

            task.progress_percent = 80
            db.commit()

            output_bytes = output_path.read_bytes()
            output_key = storage.upload_bytes(
                output_bytes,
                output_filename,
                prefix="outputs",
            )

        task.output_storage_key = output_key
        task.output_filename = output_filename
        task.output_size_bytes = len(output_bytes)
        task.status = TaskStatus.COMPLETED
        task.progress_percent = 100
        task.completed_at = datetime.now(timezone.utc)
        task.error_message = None
        db.commit()

        return {"task_id": task_id, "status": "completed", "output_key": output_key}

    except Exception as exc:
        db.rollback()
        if self.request.retries >= self.max_retries:
            task = db.get(ConversionTask, UUID(task_id))
            if task:
                task.status = TaskStatus.FAILED
                task.progress_percent = 100
                task.error_message = f"{exc}\n{traceback.format_exc()}"
                db.commit()
            raise
        raise self.retry(exc=exc, countdown=5) from exc

    finally:
        db.close()
