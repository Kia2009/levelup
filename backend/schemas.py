from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field  # type: ignore


class Posts(BaseModel):
    id: str
    created_at: datetime
    creator: str
    title: str
    contains: str
    likes: list[str] = []
    views: list[str] = []


class PostCreate(BaseModel):
    title: str = Field(..., min_length=3, description="title of the post")
    contains: str = Field(
        ..., min_length=3, description="post that user wants to share."
    )
