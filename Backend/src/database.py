from contextlib import contextmanager
import logging
from typing import Generator, Optional

from sqlalchemy import create_engine, QueuePool, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

logger = logging.getLogger(__name__)


class Database:
    def __init__(self) -> None:
        self._engine: Optional[Engine] = None
        self.Base = declarative_base()
        self.SessionLocal = sessionmaker(autoflush=False, autocommit=False)

    def init(self, database_url: str) -> None:
        if not database_url:
            logger.error("DATABASE_URL is not set in ENV")
            return

        self._engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            future=True,
        )

        try:
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connected successfully")
        except Exception as exc:
            logger.error(f"Failed to connect database: {exc}")

        self.SessionLocal.configure(bind=self._engine)

    @contextmanager
    def session(self) -> Generator[Session, None, None]:
        if self._engine is None:
            logger.error("Database is not initialized. Call db.init(...) first.")
            raise RuntimeError("Database is not initialized. Call db.init(...) first.")

        session = self.SessionLocal()
        try:
            yield session
            if session.new or session.dirty or session.deleted:
                session.commit()
        except Exception as exc:
            session.rollback()
            logger.error(f"Failed to create database session: {exc}")
            raise
        finally:
            session.close()

    def ping(self) -> bool:
        if self._engine is None:
            logger.error("Database is not initialized. Call db.init(...) first.")
            return False

        try:
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as exc:
            logger.error(f"Database ping failed: {exc}")
            return False


db = Database()
Base = db.Base
SessionLocal = db.SessionLocal


def init_database(database_url: str) -> None:
    db.init(database_url)


@contextmanager
def get_db_session():
    with db.session() as session:
        yield session


