from datetime import datetime, timedelta, UTC
from jwt import JWT

class AuthService:
    @staticmethod
    def generate_access_token(data: dict, expire_delta: int):
        to_encode = data.copy()
        expire = datetime.now(UTC) + timedelta(minutes=expire_delta)
        to_encode.update({"exp": expire})
        encode_jwt = JWT.encode(to_encode, "this is secret", "HS256")

