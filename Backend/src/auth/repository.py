import logging
from datetime import datetime

from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from auth.models import Sessions
from utils.auth import hash_ip

logger = logging.getLogger(__name__)


class AuthRepository:
    @staticmethod
    def CreateLoginSession(
        db, user_id, token: str, expire_at: datetime, device_info, ip_address: str
    ):

        try: 

            hash_ip_addr = hash_ip(ip_address)

            user_session = Sessions(
                user_id = user_id,
                token=token,
                expire_at=expire_at,
                device_info=device_info,
                ip_address_hash=hash_ip_addr,
            )

            db.add(user_session)
            db.flush()

            session_id = user_session.id
            logger.info(f"Users session created with: {session_id}")

            return session_id

        except IntegrityError as err:
            logger.error(f"Integrity error while creating user: {err}")
            raise

        except SQLAlchemyError as err:
            logger.error(f"Sql Error creating user: {err}")
            db.rollback()
            raise

    @staticmethod
    def getUserSession(db, user_id):
        try:
            session = db.query(Sessions).filter(
                Sessions.user_id == user_id,
                Sessions.revoke_at.is_(None),
            ).first()

            return session

        except SQLAlchemyError as err:
            logger.error(f"Sql Error fetching user session: {err}")
            db.rollback()
            raise

