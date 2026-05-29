from fastapi import HTTPException

from users.repository import UserRepository
from users.schemas import CreateUserRequest
from utils.auth import serialise_email


class UserService:
    @staticmethod
    def create_user(db, data: CreateUserRequest):
        serialised_email = serialise_email(data.email)
        if not serialised_email:
            raise HTTPException(400, detail="Invalid email format")

        exists = UserRepository.get_by_email(db, serialised_email)

        if exists:
            raise HTTPException(400, detail="User already exists")

        data.email = serialised_email
        res = UserRepository.create_user(db, data)

        return res.data

    @staticmethod
    def get_by_email(db, email: str):
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise HTTPException(404, detail="User not found")

        return user
