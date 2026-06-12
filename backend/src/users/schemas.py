from datetime import datetime
from pydantic import BaseModel


class UserModel(BaseModel):
    username: str
    email: str
    name: str | None
    avatar_url: str | None


class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    name: str | None = None
    avatar_url: str | None = None


class CreateUserRepoResponse(BaseModel):
    username: str
    email: str
    created_at: datetime


class UserResponse(BaseModel):
    name: str | None = None
    username: str
    email: str
    avatar_url: str | None = None
    plan: str | None = None
    ai_requests_used: int | None = None
    ai_requests_reset_at: datetime | None = None
    created_at: datetime

class UserRepoResponse(BaseModel):
    user_id: int 
    data:UserResponse

