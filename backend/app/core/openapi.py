"""OpenAPI / Swagger metadata for the GIS Converter API."""

API_DESCRIPTION = """
Geospatial file conversion service. Upload GIS files, convert between vector and raster
formats, optionally reproject CRS, and download results.

## Authentication (JWT)

Protected endpoints require a **Bearer token**.

1. Obtain a token from one of:
   - `POST /api/v1/auth/guest` — anonymous session (no body)
   - `POST /api/v1/auth/register` — create account
   - `POST /api/v1/auth/login` — sign in
2. Copy `access_token` from the JSON response.
3. In Swagger UI, click **Authorize**, enter the token (without the `Bearer ` prefix), then **Authorize** again.
4. Send the same token on every upload, task, and download request.

Tasks are scoped to the JWT `sub` claim. Use the same token for the full upload → poll → download workflow.

## Typical workflow

1. `POST /api/v1/auth/guest` (or login/register)
2. `POST /api/v1/upload` with `multipart/form-data`
3. `GET /api/v1/tasks/{task_id}` until `status` is `completed`
4. `GET /api/v1/download/{task_id}` or `GET /api/v1/tasks/{task_id}/content`

## Documentation

- Markdown examples: see `docs/API_EXAMPLES.md` in the repository
- OpenAPI JSON: `/openapi.json`
"""

TAGS_METADATA = [
    {
        "name": "auth",
        "description": "Register, login, and guest JWT issuance. These endpoints are public.",
    },
    {
        "name": "upload",
        "description": "Upload a GIS file and queue an asynchronous conversion job. **Requires JWT.**",
    },
    {
        "name": "tasks",
        "description": "List conversion jobs, poll status, and stream completed output. **Requires JWT.**",
    },
    {
        "name": "download",
        "description": "Presigned download URLs and supported format metadata.",
    },
    {
        "name": "health",
        "description": "Service health check. No authentication required.",
    },
]

OPENAPI_RESPONSES = {
    401: {
        "description": "Missing, invalid, or expired JWT",
        "content": {
            "application/json": {
                "example": {
                    "success": False,
                    "detail": "Not authenticated",
                    "error": {"code": 401, "message": "Not authenticated"},
                }
            }
        },
    },
    404: {
        "description": "Resource not found or not owned by the caller",
        "content": {
            "application/json": {
                "example": {
                    "success": False,
                    "detail": "Task not found",
                    "error": {"code": 404, "message": "Task not found"},
                }
            }
        },
    },
    409: {
        "description": "Conflict — e.g. task output not ready yet",
        "content": {
            "application/json": {
                "example": {
                    "success": False,
                    "detail": "Task is not ready for download (status: processing)",
                    "error": {
                        "code": 409,
                        "message": "Task is not ready for download (status: processing)",
                    },
                }
            }
        },
    },
}
