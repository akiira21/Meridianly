from fastapi import HTTPException


from auth.schemas import LoginRequestModel, AuthTokenResponse
from auth.repository import AuthRepository
from utils.auth import generate_access_token, generate_refresh_token, serialise_email
from users.repository import UserRepository



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

        token_payload = {"user_id": str(exists.user_id)}
        refresh_token, expire = generate_refresh_token(token_payload, config.REFRESH_TOKEN_EXPIRE, config.JWT_SECRET)
        access_token = generate_access_token(token_payload, config.ACCESS_TOKEN_EXPIRE_MINUTES, config.JWT_SECRET)

        AuthRepository.CreateLoginSession(db, exists.user_id, refresh_token, expire, device_info, client_ip)

        return AuthTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            user_id=str(exists.user_id),
        )
