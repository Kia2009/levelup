from pydantic import BaseModel, Field # type: ignore
from uuid import UUID, uuid4
from typing import List, Optional

class Posts(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    contains: str
    likes: int = 0
    views: int = 0


class PostCreate(BaseModel):
    title: str = Field(..., min_length=3, description="The title of the post.")
    contains: str = Field(..., min_length=3, description="post that user wants to share.")