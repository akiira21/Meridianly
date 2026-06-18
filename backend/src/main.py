import logging
import sys
from contextlib import asynccontextmanager

from config import Config
from database import db
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from limiter import limiter
from slowapi.errors import RateLimitExceeded
from router import v1_router

config = Config()

# Structured JSON logging in production
if not config.IS_DEVELOPMENT:
    logging.basicConfig(
        level=logging.INFO,
        format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}',
        handlers=[logging.StreamHandler(sys.stdout)],
    )
else:
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

logger = logging.getLogger(__name__)


class DynamicCORSMiddleware(BaseHTTPMiddleware):
    """
    CORS middleware that mirrors the requesting origin dynamically.
    This avoids the need to hard-code every frontend deployment URL.
    """

    def __init__(self, app, allowed_origins=None):
        super().__init__(app)
        self.allowed_origins = set(allowed_origins or [])

    async def dispatch(self, request, call_next):
        origin = request.headers.get("origin", "")

        # Determine if origin is allowed:
        # 1. If we have an explicit whitelist, use it
        # 2. In production with empty whitelist, allow any origin that sends one
        # 3. In development, allow localhost origins dynamically
        is_allowed = (
            not self.allowed_origins
            or origin in self.allowed_origins
            or (config.IS_DEVELOPMENT and "localhost" in origin)
        )

        # Handle preflight OPTIONS
        if request.method == "OPTIONS":
            if is_allowed and origin:
                return Response(
                    status_code=200,
                    headers={
                        "Access-Control-Allow-Origin": origin,
                        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Max-Age": "600",
                    },
                )
            return Response(status_code=400)

        # Actual request
        response = await call_next(request)

        if is_allowed and origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Expose-Headers"] = "Content-Type"

        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init(config.DATABASE_URL)
    if not db.ping():
        logger.error("Database ping failed on startup")
        sys.exit(1)
    logger.info("Application startup complete")
    yield
    logger.info("Application shutting down")


app = FastAPI(title="Meridian API", lifespan=lifespan)
app.state.limiter = limiter


@app.get("/health")
async def health_check():
    db_ok = db.ping()
    status_code = 200 if db_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={"status": "healthy" if db_ok else "unhealthy", "database": "ok" if db_ok else "error"},
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."},
    )


@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    logger.error(f"Runtime error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=503,
        content={"detail": "Service temporarily unavailable. Please try again later."},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Single dynamic CORS middleware that handles both preflight and actual requests
app.add_middleware(
    DynamicCORSMiddleware,
    allowed_origins=config.ALLOWED_ORIGINS,
)

API_PREFIX = "/api/v1"

app.include_router(v1_router, prefix=API_PREFIX)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=config.HOST, port=config.PORT)
