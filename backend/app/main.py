from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import auth, download, tasks, upload
from app.core.config import get_settings
from app.core.openapi import API_DESCRIPTION, OPENAPI_RESPONSES, TAGS_METADATA
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=API_DESCRIPTION,
        version="0.1.0",
        lifespan=lifespan,
        openapi_tags=TAGS_METADATA,
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(upload.router, prefix=settings.api_prefix)
    app.include_router(tasks.router, prefix=settings.api_prefix)
    app.include_router(download.router, prefix=settings.api_prefix)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else "Request failed"
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "detail": message,
                "error": {
                    "code": exc.status_code,
                    "message": message,
                },
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = exc.errors()
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "detail": "Validation failed",
                "error": {
                    "code": 422,
                    "message": "Validation failed",
                    "details": details,
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_request: Request, _exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "detail": "Internal server error",
                "error": {
                    "code": 500,
                    "message": "Internal server error",
                },
            },
        )

    @app.get(
        "/health",
        tags=["health"],
        summary="Health check",
        description="Returns `ok` when the API process is running. No authentication required.",
    )
    def health():
        return {"status": "ok"}

    return app


app = create_app()
