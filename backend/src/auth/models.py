from __future__ import annotations
from datetime import datetime 

from database import Base

from sqlalchemy import LargeBinary, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column


class Sessions(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    token: Mapped[str] = mapped_column(String(512), unique=True, nullable=False, index=True)
    expire_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoke_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    device_info: Mapped[str] = mapped_column(String(255), nullable=True)
    ip_address_hash: Mapped[bytes] = mapped_column(LargeBinary(16), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
