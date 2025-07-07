from pydantic import BaseModel, Field # type: ignore
from datetime import datetime
from typing import Optional

class Posts(BaseModel):
    id: str
    created_at: datetime
    title: str
    contains: str
    likes: int = 0
    views: int = 0

class PostCreate(BaseModel):
    title: str = Field(..., min_length=3, description="title of the post")
    contains: str = Field(..., min_length=3, description="post that user wants to share.")