from datetime import datetime

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse

from auth.schemas import LoginRequestModel, AuthTokenResponse, ActiveSessionInfo, UpdateProfileRequest, ChangePasswordRequest, UserProfileResponse
from auth.services import AuthService
from auth.repository import AuthRepository
from auth.dependencies import get_current_user
from config import Config
from database import get_db_session
from limiter import limiter
from slowapi.errors import RateLimitExceeded
from middleware.decorators import require_auth, require_admin, require_plan, rate_limit
from users.schemas import CreateUserRequest
from users.services import UserService
from users.repository import UserRepository


def get_config() -> Config:
    return Config()


auth_router = APIRouter()


@auth_router.post("/login", response_model=AuthTokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    data: LoginRequestModel,
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
        path="/api/v1/auth",
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
        path="/api/v1/auth",
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
    config: Config = Depends(get_config),
):
    # Try to identify user from refresh token cookie (works even if access token expired)
    refresh_token = request.cookies.get("refresh_token")
    user_id = None

    if refresh_token:
        try:
            from utils.auth import decode_token
            payload = decode_token(refresh_token, config.JWT_SECRET)
            user_id = payload.get("user_id")
        except Exception:
            pass

        # Revoke the session by refresh token
        AuthRepository.revokeSession(db, refresh_token)

    if user_id:
        # Also revoke any other active sessions for this user as fallback
        active_sessions = AuthRepository.getActiveSessions(db, int(user_id))
        for session in active_sessions:
            if session.token != refresh_token:
                session.revoke_at = datetime.now()
        db.commit()

    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
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
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")

    return {"message": "Session revoked successfully"}


@auth_router.post("/register", status_code=201)
@limiter.limit("3/hour")
def register(request: Request, data: CreateUserRequest, db=Depends(get_db_session)):
    user = UserService.create_user(db, data)
    return user


# --- Middleware-decorated examples ---

@auth_router.get("/users", tags=["admin"])
@require_auth
@require_admin
@rate_limit("30/minute")
def list_all_users(
    db=Depends(get_db_session),
    user=Depends(get_current_user),
):
    """Admin-only: list all users. Uses @require_auth + @require_admin + @rate_limit decorators."""
    from sqlalchemy import select
    from users.models import Users
    result = db.execute(select(Users))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role.value,
            "plan": u.plan.value,
            "ai_requests_used": u.ai_requests_used,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@auth_router.get("/me/plan", tags=["user"])
@require_auth
@rate_limit("60/minute")
def get_my_plan(user: dict = Depends(get_current_user)):
    """Get current user's plan info. Uses @require_auth + @rate_limit decorators."""
    u = user["data"]
    return {
        "user_id": user["user_id"],
        "username": u.username,
        "plan": u.plan.value if hasattr(u, "plan") else "free",
        "role": u.role.value,
    }


@auth_router.get("/me", response_model=UserProfileResponse, tags=["user"])
@require_auth
@rate_limit("60/minute")
def get_my_profile(user: dict = Depends(get_current_user)):
    """Get current user's full profile."""
    u = user["data"]
    return UserProfileResponse(
        user_id=user["user_id"],
        username=u.username,
        email=u.email,
        name=u.name,
        avatar_url=u.avatar_url,
        plan=u.plan.value if hasattr(u, "plan") else "free",
        role=u.role.value if hasattr(u, "role") else "user",
        ai_requests_used=u.ai_requests_used or 0,
        ai_requests_reset_at=u.ai_requests_reset_at,
        ai_insights_enabled=u.ai_insights_enabled if hasattr(u, "ai_insights_enabled") else True,
        created_at=u.created_at,
    )


@auth_router.patch("/me", tags=["user"])
@require_auth
@rate_limit("30/minute")
def update_my_profile(
    data: UpdateProfileRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_db_session),
):
    """Update current user's profile (name, avatar_url)."""
    updated = UserRepository.update_user(
        db,
        user_id=user["user_id"],
        name=data.name,
        avatar_url=data.avatar_url,
        ai_insights_enabled=data.ai_insights_enabled,
    )
    if not updated:
        return JSONResponse(
            content={"detail": "User not found"},
            status_code=404,
        )
    u = updated.data
    return UserProfileResponse(
        user_id=updated.user_id,
        username=u.username,
        email=u.email,
        name=u.name,
        avatar_url=u.avatar_url,
        plan=u.plan or "free",
        role="user",
        ai_requests_used=u.ai_requests_used or 0,
        ai_requests_reset_at=u.ai_requests_reset_at,
        ai_insights_enabled=u.ai_insights_enabled or True,
        created_at=u.created_at,
    )


@auth_router.post("/change-password", tags=["user"])
@require_auth
@rate_limit("10/minute")
def change_password(
    data: ChangePasswordRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_db_session),
):
    """Change password with old password verification."""
    success = UserRepository.change_password(
        db,
        user_id=user["user_id"],
        old_password=data.old_password,
        new_password=data.new_password,
    )
    if success is None:
        return JSONResponse(
            content={"detail": "User not found"},
            status_code=404,
        )
    if not success:
        return JSONResponse(
            content={"detail": "Incorrect old password"},
            status_code=400,
        )
    return {"message": "Password changed successfully"}
