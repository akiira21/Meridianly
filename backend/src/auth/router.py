from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse

from auth.schemas import LoginRequestModel, AuthTokenResponse, ActiveSessionInfo
from auth.services import AuthService
from auth.repository import AuthRepository
from auth.dependencies import get_current_user
from config import Config
from database import get_db_session
from users.schemas import CreateUserRequest
from users.services import UserService


def get_config() -> Config:
    return Config()


auth_router = APIRouter()


@auth_router.post("/login", response_model=AuthTokenResponse)
def login(
    response: Response,
    data: LoginRequestModel,
    request: Request,
    db=Depends(get_db_session),
    config: Config = Depends(get_config),
):
    device_info = request.headers.get("User-Agent")
    client_ip = request.client.host if request.client else "unknown"

    result = AuthService.login(db, data, config, device_info, client_ip)

    response.set_cookie(
        key="refresh_token",
        value=result.refresh_token,
        httponly=True,
        secure=not config.IS_DEVELOPMENT,
        samesite="lax",
        max_age=config.REFRESH_TOKEN_EXPIRE * 24 * 60 * 60,
        path="/api/v1/auth/refresh",
    )

    return AuthTokenResponse(
        access_token=result.access_token,
        token_type=result.token_type,
        user_id=result.user_id,
    )


@auth_router.post("/refresh", response_model=AuthTokenResponse)
def refresh_token(
    response: Response,
    request: Request,
    db=Depends(get_db_session),
    config: Config = Depends(get_config),
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return JSONResponse(
            content={"detail": "Missing refresh token"},
            status_code=401,
        )

    result = AuthService.refresh(db, refresh_token, config)
    if not result:
        return JSONResponse(
            content={"detail": "Invalid or expired refresh token"},
            status_code=401,
        )

    response.set_cookie(
        key="refresh_token",
        value=result.refresh_token,
        httponly=True,
        secure=not config.IS_DEVELOPMENT,
        samesite="lax",
        max_age=config.REFRESH_TOKEN_EXPIRE * 24 * 60 * 60,
        path="/api/v1/auth/refresh",
    )

    return AuthTokenResponse(
        access_token=result.access_token,
        token_type=result.token_type,
        user_id=result.user_id,
    )


@auth_router.post("/logout")
def logout(
    response: Response,
    request: Request,
    db=Depends(get_db_session),
):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        AuthRepository.revokeSession(db, refresh_token)

    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")
    return {"message": "Logged out successfully"}


@auth_router.get("/sessions", response_model=list[ActiveSessionInfo])
def get_sessions(
    db=Depends(get_db_session),
    user=Depends(get_current_user),
):
    sessions = AuthRepository.getActiveSessions(db, user["user_id"])
    return [
        ActiveSessionInfo(
            session_id=s.id,
            device_info=s.device_info,
            created_at=s.created_at,
        )
        for s in sessions
    ]


@auth_router.post("/sessions/{session_id}/revoke")
def revoke_session(
    session_id: int,
    response: Response,
    request: Request,
    db=Depends(get_db_session),
    user=Depends(get_current_user),
):
    revoked = AuthRepository.revokeSessionById(db, session_id, user["user_id"])
    if not revoked:
        return JSONResponse(
            content={"detail": "Session not found"},
            status_code=404,
        )

    revoked_token = request.cookies.get("refresh_token")
    if revoked_token:
        AuthRepository.revokeSession(db, revoked_token)
    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")

    return {"message": "Session revoked successfully"}


@auth_router.post("/register", status_code=201)
def register(data: CreateUserRequest, db=Depends(get_db_session)):
    user = UserService.create_user(db, data)
    return user
