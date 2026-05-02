from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    name: str | None = None 
    username: str
    email: str
    created_at: datetime
    updated_at: datetime
