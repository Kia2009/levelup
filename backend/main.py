from fastapi import FastAPI, HTTPException, status # type: ignore
from pydantic import BaseModel, Field # type: ignore
from uuid import UUID, uuid4
from typing import List, Optional

app = FastAPI(
    title="post manager",
    description="A basic API to manage posts created by users.",
    version="1.0.0",
)

class Posts(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    contains: str
    likes: int = 0
    views: int = 0


class PostCreate(BaseModel):
    title: str = Field(..., min_length=3, description="The title of the post.")
    contains: str = Field(..., min_length=3, description="post that user wants to share.")

db: List[Posts] = [
    Posts(title="First Post", contains="This is the first example post.", likes=2, views=10),
    Posts(title="Second Post", contains="Another example post for testing.", likes=5, views=25),
    Posts(title="Hello World", contains="Welcome to the post manager API!", likes=1, views=5)
]


@app.get("/", tags=["General"], summary="Root endpoint with a welcome message")
def read_root():
    """
    A simple welcome message to confirm the API is running.
    """
    return {"message": "Welcome to Post API! Visit /docs for the API documentation."}

@app.get("/posts", response_model=List[Posts], tags=["Posts"], summary="Get all Posts")
def get_all_posts():
    """
    Retrieve a list of all posts currently in the database.
    """
    return db

@app.post("/posts", response_model=Posts, status_code=status.HTTP_201_CREATED, tags=["Posts"], summary="Create a new post")
def create_post(post_create: PostCreate):
    """
    Create a post.
    - **title**: The content of the task (must be at least 3 characters).
    - **contains**: The message of the post (must be at least 3 characters).
    """
    # Create a new Post instance from the request body
    new_post = Posts(title=post_create.title , contains=post_create.contains, likes=0, views=0)
    # Add it to our "database"
    db.append(new_post)
    return new_post

@app.get("/posts/{post_id}", response_model=Posts, tags=["Posts"], summary="Get a single post by ID")
def get_post_by_id(post_id: UUID):
    """
    Retrieve a single post by its unique ID.
    """
    # Find the post in the database
    for post in db:
        if post.id == post_id:
            return post
    # If not found, raise an HTTP 404 error
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with ID {post_id} not found")

@app.post("/posts/{post_id}/like", response_model=Posts, tags=["Posts"], summary="Like a post")
def like_post(post_id: UUID, amount: int = 1):
    """
    Increment the number of likes for a post by a given amount (default is 1).
    """
    for post in db:
        if post.id == post_id:
            post.likes += amount
            return post
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with ID {post_id} not found")

@app.post("/posts/{post_id}/view", response_model=Posts, tags=["Posts"], summary="View a post")
def view_post(post_id: UUID, amount: int = 1):
    """
    Increment the number of views for a post by a given amount (default is 1).
    """
    for post in db:
        if post.id == post_id:
            post.views += amount
            return post
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with ID {post_id} not found")

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Posts"], summary="Delete a Post")
def delete_todo(post_id: UUID):
    """
    Delete a post by its unique ID.
    """
    # Find the to-do item
    for index, post in enumerate(db):
        if post.id == post_id:
            # Remove it from the list
            db.pop(index)
            # Return a 204 No Content response, as is standard for successful deletions
            return
    # If not found, raise an HTTP 404 error
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"To-do item with ID {post_id} not found")



