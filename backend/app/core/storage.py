import io
import uuid
from pathlib import PurePosixPath

import boto3
from botocore.client import Config

from app.core.config import Settings, get_settings


class StorageClient:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._client = self._make_client(self.settings.minio_endpoint)
        self._ensure_bucket()

    def _make_client(self, endpoint: str):
        return boto3.client(
            "s3",
            endpoint_url=self._endpoint_url(endpoint),
            aws_access_key_id=self.settings.minio_access_key,
            aws_secret_access_key=self.settings.minio_secret_key,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",
        )

    def _endpoint_url(self, endpoint: str) -> str:
        scheme = "https" if self.settings.minio_secure else "http"
        return f"{scheme}://{endpoint}"

    def _public_endpoint(self) -> str:
        return self.settings.minio_public_endpoint or self.settings.minio_endpoint

    def _ensure_bucket(self) -> None:
        bucket = self.settings.minio_bucket
        existing = {b["Name"] for b in self._client.list_buckets().get("Buckets", [])}
        if bucket not in existing:
            self._client.create_bucket(Bucket=bucket)

    def upload_bytes(self, data: bytes, filename: str, prefix: str = "uploads") -> str:
        key = self._build_key(prefix, filename)
        self._client.put_object(
            Bucket=self.settings.minio_bucket,
            Key=key,
            Body=data,
            ContentType=self._guess_content_type(filename),
        )
        return key

    def upload_fileobj(self, fileobj: io.IOBase, filename: str, prefix: str = "uploads") -> str:
        key = self._build_key(prefix, filename)
        self._client.upload_fileobj(
            fileobj,
            self.settings.minio_bucket,
            key,
            ExtraArgs={"ContentType": self._guess_content_type(filename)},
        )
        return key

    def download_bytes(self, key: str) -> bytes:
        response = self._client.get_object(Bucket=self.settings.minio_bucket, Key=key)
        return response["Body"].read()

    def download_to_path(self, key: str, dest_path: str) -> None:
        self._client.download_file(self.settings.minio_bucket, key, dest_path)

    def delete(self, key: str) -> None:
        self._client.delete_object(Bucket=self.settings.minio_bucket, Key=key)

    def presigned_url(
        self, key: str, expires_in: int = 3600, download_filename: str | None = None
    ) -> str:
        public_endpoint = self._public_endpoint()
        if public_endpoint == self.settings.minio_endpoint:
            client = self._client
        else:
            client = self._make_client(public_endpoint)

        params: dict[str, str] = {"Bucket": self.settings.minio_bucket, "Key": key}
        if download_filename:
            params["ResponseContentDisposition"] = f'attachment; filename="{download_filename}"'

        return client.generate_presigned_url(
            "get_object",
            Params=params,
            ExpiresIn=expires_in,
        )

    @staticmethod
    def _build_key(prefix: str, filename: str) -> str:
        safe_name = PurePosixPath(filename).name
        return f"{prefix}/{uuid.uuid4().hex}_{safe_name}"

    @staticmethod
    def _guess_content_type(filename: str) -> str:
        ext = PurePosixPath(filename).suffix.lower()
        mapping = {
            ".geojson": "application/geo+json",
            ".json": "application/json",
            ".zip": "application/zip",
            ".kml": "application/vnd.google-earth.kml+xml",
            ".gpkg": "application/geopackage+sqlite3",
            ".csv": "text/csv",
            ".shp": "application/octet-stream",
        }
        return mapping.get(ext, "application/octet-stream")


def get_storage_client() -> StorageClient:
    return StorageClient()
