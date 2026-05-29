from pydantic import BaseModel

class LoginRequestModel(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user_id: str

class TokenData(BaseModel):
    user_id: str
