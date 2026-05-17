from fastapi import APIRouter

from auth.schemas import LoginRequestModel
from database import get_db_session
from users.schemas import CreateUserRequest
from users.services import UserService

auth_router = APIRouter()


@auth_router.post("/login")
def login(data: LoginRequestModel):
    return {"data": data}


@auth_router.post("/register")
def register(data: CreateUserRequest):
    with get_db_session() as db:
        user = UserService.create_user(db, data)
        return {"data": user}
