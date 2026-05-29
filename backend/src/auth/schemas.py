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
