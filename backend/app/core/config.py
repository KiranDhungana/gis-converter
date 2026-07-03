from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "GIS Converter"
    debug: bool = False
    api_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg2://gis:gis@postgres:5432/gis_converter"

    redis_url: str = "redis://redis:6379/0"
    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/1"

    minio_endpoint: str = "minio:9000"
    minio_public_endpoint: str | None = None
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "gis-files"
    minio_secure: bool = False

    max_upload_size_mb: int = 100
    allowed_input_extensions: list[str] = [
        ".geojson",
        ".json",
        ".zip",
        ".kml",
        ".gpkg",
        ".csv",
        ".shp",
        ".tif",
        ".tiff",
    ]

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    jwt_secret_key: str = "9w3NQeTU8bXjGG61VF0ke7cLOcLuT7m0HDDTTBxUrX7"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    jwt_guest_expire_minutes: int = 60 * 24 * 30


@lru_cache
def get_settings() -> Settings:
    return Settings()
