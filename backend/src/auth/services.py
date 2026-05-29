from fastapi import HTTPException
from datetime import datetime

from auth.schemas import LoginRequestModel, AuthTokenResponse, LoginTokenServiceResponse
from auth.repository import AuthRepository
from utils.auth import generate_access_token, generate_refresh_token, decode_token, serialise_email
from users.repository import UserRepository

MAX_ACTIVE_SESSIONS = 2


class AuthService:
    @staticmethod
    def login(db, userLoginRequest: LoginRequestModel, config, device_info, client_ip):
        serialised_email = serialise_email(userLoginRequest.email)
        if not serialised_email:
            raise HTTPException(400, "Invalid email format")

        exists = UserRepository.verify_user(
            db, serialised_email, userLoginRequest.password
        )
        if not exists:
            raise HTTPException(401, "Invalid email or password")

        active_sessions = AuthRepository.getActiveSessions(db, exists.user_id)
        if len(active_sessions) >= MAX_ACTIVE_SESSIONS:
            session_list = [
                {
                    "session_id": s.id,
                    "device_info": s.device_info,
                    "created_at": s.created_at.isoformat(),
                }
                for s in active_sessions
            ]
            raise HTTPException(
                status_code=429,
                detail={
                    "code": "MAX_SESSIONS_EXCEEDED",
                    "message": f"Maximum {MAX_ACTIVE_SESSIONS} active sessions allowed. Please log out from other devices.",
                    "active_sessions": session_list,
                },
            )

        token_payload = {"user_id": str(exists.user_id)}
        refresh_token, expire = generate_refresh_token(token_payload, config.REFRESH_TOKEN_EXPIRE, config.JWT_SECRET)
        access_token = generate_access_token(token_payload, config.ACCESS_TOKEN_EXPIRE_MINUTES, config.JWT_SECRET)

        AuthRepository.CreateLoginSession(db, exists.user_id, refresh_token, expire, device_info, client_ip)

        return LoginTokenServiceResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            user_id=str(exists.user_id),
        )

    @staticmethod
    def refresh(db, token: str, config):
        try:
            payload = decode_token(token, config.JWT_SECRET)
            user_id = payload.get("user_id")
            if not user_id:
                return None
        except Exception:
            return None

        session = AuthRepository.getUserSession(db, int(user_id))
        if not session or session.token != token:
            return None

        user = UserRepository.get_by_id(db, int(user_id))
        if not user:
            return None

        token_payload = {"user_id": str(user_id)}
        new_refresh_token, expire = generate_refresh_token(token_payload, config.REFRESH_TOKEN_EXPIRE, config.JWT_SECRET)
        access_token = generate_access_token(token_payload, config.ACCESS_TOKEN_EXPIRE_MINUTES, config.JWT_SECRET)

        AuthRepository.CreateLoginSession(db, int(user_id), new_refresh_token, expire, session.device_info, session.ip_address_hash)

        return LoginTokenServiceResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="Bearer",
            user_id=str(user_id),
        )
