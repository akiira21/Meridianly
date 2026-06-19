from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging

from users.schemas import CreateUserRequest, UserRepoResponse, UserResponse
from users.models import Users

from utils.auth import generate_hash, verify_password


logger = logging.getLogger(__name__)

class UserRepository:
    @staticmethod
    def create_user(db, data: CreateUserRequest):
        try:
            user = Users(
                username=data.username,
                email=data.email,
                password=generate_hash(data.password),
                name=data.name,
                avatar_url=data.avatar_url
            )

            db.add(user)
            db.commit()
            db.refresh(user)

            res = UserRepoResponse(
                    user_id=user.id,
                    data=UserResponse(
                    name=user.name,
                    username=user.username,
                    email=user.email,
                    avatar_url=user.avatar_url,
                    plan=user.plan.value,
                    ai_requests_used=user.ai_requests_used,
                    ai_requests_reset_at=user.ai_requests_reset_at,
                    created_at=user.created_at
                    ))

            return res

        except IntegrityError as err:
            logger.error(f"Integrity error while creating user: {err}")
            db.rollback()
            raise

        except SQLAlchemyError as err:
            logger.error(f"Sql Error creating user: {err}")
            db.rollback()
            raise

    @staticmethod
    def get_by_id(db, user_id: int):
        try:
            user = db.query(Users).filter(Users.id == user_id).first()

            if user:
                return UserResponse(
                    name=user.name,
                    username=user.username,
                    email=user.email,
                    avatar_url=user.avatar_url,
                    plan=user.plan.value,
                    ai_requests_used=user.ai_requests_used,
                    ai_requests_reset_at=user.ai_requests_reset_at,
                    created_at=user.created_at,
                )
            return None

        except SQLAlchemyError as err:
            logger.error(f"Error while fetching user details: {err}")
            raise

    @staticmethod
    def get_by_email(db, email: str):
        try:
            user = db.query(Users).filter(Users.email == email).first()

            if user:
                return UserRepoResponse(
                    user_id=user.id,
                    data=UserResponse(
                        name=user.name,
                        username=user.username,
                        email=user.email,
                        avatar_url=user.avatar_url,
                        plan=user.plan.value,
                        ai_requests_used=user.ai_requests_used,
                        ai_requests_reset_at=user.ai_requests_reset_at,
                        created_at=user.created_at,
                    )
                )

            return None

        except SQLAlchemyError as err:
            logger.error(f"Error in finding user with email: {err}")
            raise

    @classmethod
    def verify_user(cls, db, email: str, password: str):
        try:
            user = db.query(Users).filter(Users.email == email).first()
            if not user:
                return None

            if verify_password(password, user.password):
                return UserRepoResponse(
                    user_id=user.id,
                    data=UserResponse(
                        name=user.name,
                        username=user.username,
                        email=user.email,
                        avatar_url=user.avatar_url,
                        plan=user.plan.value,
                        ai_requests_used=user.ai_requests_used,
                        ai_requests_reset_at=user.ai_requests_reset_at,
                        created_at=user.created_at,
                    )
                )

            return None

        except SQLAlchemyError as err:
            logger.error(f"Error verifying user: {err}")
            raise

    @staticmethod
    def update_user(db, user_id: int, name: str | None = None, avatar_url: str | None = None):
        try:
            user = db.query(Users).filter(Users.id == user_id).first()
            if not user:
                return None

            if name is not None:
                user.name = name
            if avatar_url is not None:
                user.avatar_url = avatar_url

            db.commit()
            db.refresh(user)

            return UserRepoResponse(
                user_id=user.id,
                data=UserResponse(
                    name=user.name,
                    username=user.username,
                    email=user.email,
                    avatar_url=user.avatar_url,
                    plan=user.plan.value,
                    ai_requests_used=user.ai_requests_used,
                    ai_requests_reset_at=user.ai_requests_reset_at,
                    created_at=user.created_at,
                )
            )
        except SQLAlchemyError as err:
            logger.error(f"Error updating user: {err}")
            db.rollback()
            raise

    @staticmethod
    def change_password(db, user_id: int, old_password: str, new_password: str):
        try:
            user = db.query(Users).filter(Users.id == user_id).first()
            if not user:
                return None

            if not verify_password(old_password, user.password):
                return False

            user.password = generate_hash(new_password)
            db.commit()
            return True
        except SQLAlchemyError as err:
            logger.error(f"Error changing password: {err}")
            db.rollback()
            raise
