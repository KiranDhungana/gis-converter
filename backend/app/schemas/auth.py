from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserPublic(BaseModel):
    """Public user profile returned after login or registration."""

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "email": "user@example.com",
                "name": "Demo User",
            }
        },
    )

    id: UUID
    email: EmailStr | None = None
    name: str | None = None


class RegisterRequest(BaseModel):
    """Create a new account."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "password": "secret12",
                "name": "Demo User",
            }
        }
    )

    email: EmailStr = Field(description="Unique email address")
    password: str = Field(min_length=6, max_length=128, description="Minimum 6 characters")
    name: str | None = Field(default=None, max_length=255, description="Display name")


class LoginRequest(BaseModel):
    """Authenticate with email and password."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"email": "user@example.com", "password": "secret12"}
        }
    )

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    """JWT access token and optional user profile."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 604800,
                "user": {
                    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                    "email": "user@example.com",
                    "name": "Demo User",
                },
            }
        }
    )

    access_token: str = Field(description="JWT to send as `Authorization: Bearer <token>`")
    token_type: str = Field(default="bearer", description="Always `bearer`")
    expires_in: int = Field(description="Token lifetime in seconds")
    user: UserPublic | None = Field(
        default=None, description="Present for login/register; null for guest tokens"
    )
