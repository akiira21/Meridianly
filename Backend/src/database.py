
from contextlib import contextmanager
from sqlalchemy import create_engine, QueuePool 
from sqlalchemy.orm import declarative_base, sessionmaker  
import logging  


from main import config


DATABASE_URL = config.DATABASE_URL
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in ENV")


logger = logging.getLogger(__name__) 


engine = create_engine(DATABASE_URL, poolclass=QueuePool,  pool_size=10, max_overflow=20, pool_pre_ping=True, pool_recycle=3600, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False) 

Base = declarative_base()

@contextmanager
def get_db_session():
    session = SessionLocal()
    try:
        yield session 
        session.commit()

    except Exception as e:
        session.rollback()
        logger.error(f"Failed to create database session: {e}")

    finally:
        session.close()


