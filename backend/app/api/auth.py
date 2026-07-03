import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.openapi import OPENAPI_RESPONSES
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import User
from app.db.session import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_response(
    subject: str,
    *,
    token_type: str,
    expires_minutes: int,
    user: User | None = None,
) -> TokenResponse:
    access_token, expires_in = create_access_token(
        subject,
        token_type=token_type,
        expires_minutes=expires_minutes,
        extra_claims={"email": user.email} if user else None,
    )
    return TokenResponse(
        access_token=access_token,
        expires_in=expires_in,
        user=UserPublic.model_validate(user) if user else None,
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create an account and return a JWT. The token is scoped to the new user ID.",
    responses={409: {"description": "Email already registered"}},
)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = body.email.strip().lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        name=(body.name or email.split("@")[0]).strip() or email.split("@")[0],
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    settings = get_settings()
    return _token_response(
        str(user.id),
        token_type="user",
        expires_minutes=settings.jwt_expire_minutes,
        user=user,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login",
    description="Authenticate with email and password. Returns a JWT for the user account.",
    responses={401: {"description": "Invalid email or password"}},
)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = body.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    settings = get_settings()
    return _token_response(
        str(user.id),
        token_type="user",
        expires_minutes=settings.jwt_expire_minutes,
        user=user,
    )


@router.post(
    "/guest",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create guest session",
    description=(
        "Issue a JWT for anonymous use. No request body required. "
        "Guest tokens expire after `JWT_GUEST_EXPIRE_MINUTES` (default 30 days)."
    ),
)
def guest_session() -> TokenResponse:
    settings = get_settings()
    guest_id = f"guest_{uuid.uuid4()}"
    return _token_response(
        guest_id,
        token_type="guest",
        expires_minutes=settings.jwt_guest_expire_minutes,
    )
