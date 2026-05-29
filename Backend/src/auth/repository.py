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
            db.commit()
            db.refresh(user_session)

            session_id = user_session.id
            logger.info(f"Users session created with: {session_id}")

            return session_id

        except IntegrityError as err:
            logger.error(f"Integrity error while creating session: {err}")
            db.rollback()
            raise

        except SQLAlchemyError as err:
            logger.error(f"Sql Error creating session: {err}")
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

    @staticmethod
    def getActiveSessions(db, user_id):
        try:
            sessions = db.query(Sessions).filter(
                Sessions.user_id == user_id,
                Sessions.revoke_at.is_(None),
            ).order_by(Sessions.created_at.desc()).all()

            return sessions

        except SQLAlchemyError as err:
            logger.error(f"Sql Error fetching active sessions: {err}")
            db.rollback()
            raise

    @staticmethod
    def revokeSession(db, token: str):
        try:
            session = db.query(Sessions).filter(Sessions.token == token).first()
            if session:
                session.revoke_at = datetime.now()
                db.commit()
                return True
            return False

        except SQLAlchemyError as err:
            logger.error(f"Sql Error revoking session: {err}")
            db.rollback()
            raise

    @staticmethod
    def revokeSessionById(db, session_id: int, user_id: int):
        try:
            session = db.query(Sessions).filter(
                Sessions.id == session_id,
                Sessions.user_id == user_id,
                Sessions.revoke_at.is_(None),
            ).first()

            if session:
                session.revoke_at = datetime.now()
                db.commit()
                return True
            return False

        except SQLAlchemyError as err:
            logger.error(f"Sql Error revoking session by id: {err}")
            db.rollback()
            raise

