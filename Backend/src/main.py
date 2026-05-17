from contextlib import asynccontextmanager

from config import Config
from database import db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from router import v1_router

config = Config()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init(config.DATABASE_URL)
    yield


app = FastAPI(title="Meridian API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(v1_router, prefix=API_PREFIX)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=config.HOST, port=config.PORT)
