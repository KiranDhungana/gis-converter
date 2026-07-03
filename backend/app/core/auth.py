from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.core.security import decode_access_token
from app.db.models import ConversionTask

bearer_scheme = HTTPBearer(
    scheme_name="BearerAuth",
    description=(
        "JWT from POST /api/v1/auth/guest, /api/v1/auth/login, or /api/v1/auth/register. "
        "Enter the access_token value only (Swagger adds the Bearer prefix)."
    ),
    auto_error=False,
)


def get_current_subject(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")
        token_type = payload.get("type")
        if not subject or token_type not in {"user", "guest"}:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return str(subject)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def apply_task_owner_filter(query, owner_id: str):
    return query.where(ConversionTask.user_id == owner_id)


def verify_task_access(task: ConversionTask, owner_id: str) -> None:
    if task.user_id != owner_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
