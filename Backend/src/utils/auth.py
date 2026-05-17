import bcrypt

def generate_hash(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password, hash_password) -> bool:
    if not hash_password:
        return False

    return bcrypt.checkpw(password.encode('utf-8'), hash_password.encode('utf-8'))


def serialise_email(email):
    if not email or not isinstance(email, str):
        return None

    email = email.replace(" ", "")
    serialised_email = email.lower()

    return serialised_email

