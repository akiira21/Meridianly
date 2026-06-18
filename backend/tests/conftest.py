import os

os.environ["ENV"] = "test"
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "postgresql+psycopg2://root:secret@localhost:5432/meridian_test")
os.environ["JWT_SECRET"] = os.getenv("JWT_SECRET", "test-secret-minimum-32-characters-long")
os.environ["REDIS_URL"] = os.getenv("REDIS_URL", "redis://localhost:6379/1")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, db
from main import app
from limiter import limiter

# Disable rate limiting for tests
limiter.enabled = False

# Use a test engine directly
engine = create_engine(os.environ["DATABASE_URL"], future=True)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="function")
def client():
    reset_db()
    db._engine = engine
    db.SessionLocal.configure(bind=engine)
    with TestClient(app) as c:
        yield c
    db._engine = None
