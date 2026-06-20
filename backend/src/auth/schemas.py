from datetime import datetime
from pydantic import BaseModel

class LoginRequestModel(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

class LoginTokenServiceResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user_id: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user_id: str

class TokenData(BaseModel):
    user_id: str

class ActiveSessionInfo(BaseModel):
    session_id: int
    device_info: str | None
    created_at: datetime

class MaxSessionsExceededResponse(BaseModel):
    detail: str
    active_sessions: list[ActiveSessionInfo]

class UpdateProfileRequest(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    ai_insights_enabled: bool | None = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UserProfileResponse(BaseModel):
    user_id: int
    username: str
    email: str
    name: str | None = None
    avatar_url: str | None = None
    plan: str
    role: str
    ai_requests_used: int
    ai_requests_reset_at: datetime | None = None
    ai_insights_enabled: bool
    created_at: datetime
