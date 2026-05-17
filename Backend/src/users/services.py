from fastapi import HTTPException

from users.repository import UserRepository
from users.schemas import CreateUserRequest


class UserService:
    @staticmethod
    def create_user(db, data: CreateUserRequest):
        exists = UserRepository.get_by_email(db, data.email)

        if exists:
            raise HTTPException(400, detail="User already exits")

        return UserRepository.create_user(db, data)

    @staticmethod
    def get_by_email(db, email: str):
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise HTTPException(404, detail="User not found")

        return user
