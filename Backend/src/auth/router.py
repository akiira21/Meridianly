from fastapi import APIRouter, Depends, Request

from auth.schemas import LoginRequestModel, AuthTokenResponse
from auth.services import AuthService
from config import Config
from database import get_db_session
from users.schemas import CreateUserRequest
from users.services import UserService


def get_config() -> Config:
    return Config()


auth_router = APIRouter()


@auth_router.post("/login", response_model=AuthTokenResponse)
def login(
    data: LoginRequestModel,
    request: Request,
    db=Depends(get_db_session),
    config: Config = Depends(get_config),
):
    device_info = request.headers.get("User-Agent")
    client_ip = request.client.host if request.client else "unknown"

    result = AuthService.login(db, data, config, device_info, client_ip)
    return result


@auth_router.post("/register", status_code=201)
def register(data: CreateUserRequest, db=Depends(get_db_session)):
    user = UserService.create_user(db, data)
    return user
