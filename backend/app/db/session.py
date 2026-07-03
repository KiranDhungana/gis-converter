from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _migrate_schema() -> None:
    statements = [
        "ALTER TABLE conversion_tasks ADD COLUMN IF NOT EXISTS output_filename VARCHAR(512)",
        "ALTER TABLE conversion_tasks ADD COLUMN IF NOT EXISTS output_size_bytes BIGINT",
        (
            "ALTER TABLE conversion_tasks ADD COLUMN IF NOT EXISTS "
            "progress_percent INTEGER NOT NULL DEFAULT 0"
        ),
        "ALTER TABLE conversion_tasks ADD COLUMN IF NOT EXISTS user_id VARCHAR(64)",
        "ALTER TABLE conversion_tasks ADD COLUMN IF NOT EXISTS session_id VARCHAR(64)",
        "CREATE INDEX IF NOT EXISTS ix_conversion_tasks_user_id ON conversion_tasks (user_id)",
        "CREATE INDEX IF NOT EXISTS ix_conversion_tasks_session_id ON conversion_tasks (session_id)",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))


def init_db() -> None:
    from app.db import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _migrate_schema()
