"""OpenAPI / Swagger metadata for the GIS Converter API."""

API_DESCRIPTION = """
Geospatial file conversion service. Upload GIS files, convert between vector and raster
formats, optionally reproject CRS, and download results.

Protected endpoints require a Bearer JWT from `POST /api/v1/auth/guest`, `register`, or `login`.
Send the token in the `Authorization` header for upload, task, and download requests.
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
