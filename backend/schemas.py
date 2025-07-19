from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field  # type: ignore


class User(BaseModel):
    user_id: str
    coins: int = 0


class Comment(BaseModel):
    id: int
    post_id: int
    user_id: str
    creator: str
    content: str
    created_at: datetime
    likes: List[str] = []
    views: List[str] = []


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, description="Content of the comment")


class Posts(BaseModel):
    id: int
    created_at: datetime
    creator: str
    user_id: str
    title: str
    contains: str
    likes: List[str] = []
    views: List[str] = []


class PostCreate(BaseModel):
    title: str = Field(..., min_length=3, description="title of the post")
    contains: str = Field(
        ..., min_length=3, description="post that user wants to share."
    )
