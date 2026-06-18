from datetime import UTC, datetime, timedelta
import re
import uuid
import bcrypt
import hashlib
import ipaddress
import jwt

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def generate_hash(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password, hash_password) -> bool:
    if not hash_password:
        return False

    return bcrypt.checkpw(password.encode('utf-8'), hash_password.encode('utf-8'))


def hash_ip(ip_address: str) -> bytes:
    try:
        packed = ipaddress.ip_address(ip_address).packed
    except ValueError:
        packed = ip_address.encode("utf-8")
    return hashlib.sha256(packed).digest()[:16]


def serialise_email(email):
    if not email or not isinstance(email, str):
        return None

    email = email.replace(" ", "")
    if not EMAIL_REGEX.match(email):
        return None

    return email.lower()

def generate_access_token(data: dict, expire_delta: int, SECRET_KEY: str):
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=expire_delta)
    to_encode.update({"exp": expire})

    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm='HS256')
    return encoded

def generate_refresh_token(data: dict, expire_delta: int, SECRET_KEY: str):
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(days=expire_delta)
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})

    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm='HS256')
    return encoded, expire


def decode_token(token: str, SECRET_KEY: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
