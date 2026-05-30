from contextlib import asynccontextmanager

from config import Config
from database import db
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from limiter import limiter
from slowapi.errors import RateLimitExceeded
from router import v1_router

config = Config()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init(config.DATABASE_URL)
    yield


app = FastAPI(title="Meridian API", lifespan=lifespan)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

API_PREFIX = "/api/v1"

app.include_router(v1_router, prefix=API_PREFIX)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=config.HOST, port=config.PORT)
