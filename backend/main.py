from fastapi import FastAPI, HTTPException, status, Body  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from typing import List
from schemas import *
from supabase import create_client, Client  # type: ignore
from dotenv import load_dotenv  # type: ignore
import os

load_dotenv()

app = FastAPI(
    title="post manager",
    description="A basic API to manage posts created by users.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


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
    result = supabase.table('posts').select(
        '*').order('created_at', desc=True).execute()
    return result.data


@app.post("/posts", response_model=Posts, status_code=status.HTTP_201_CREATED, tags=["Posts"], summary="Create a new post")
def create_post(post_create: PostCreate):
    """
    Create a post.
    - **title**: The title of the post (must be at least 3 characters).
    - **contains**: The message of the post (must be at least 3 characters).
    """
    result = supabase.table('posts').insert(
        {
            'title': post_create.title,
            'contains': post_create.contains,
            'user_id': post_create.user_id,
            'user_name': post_create.user_name,
        }
    ).execute()
    return result.data[0]


@app.get("/posts/{post_id}", response_model=Posts, tags=["Posts"], summary="Get a single post by ID")
def get_post_by_id(post_id: int):
    """
    Retrieve a single post by its unique ID.
    """
    result = supabase.table('posts').select('*').eq('id', post_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Post with ID {post_id} not found")
    return result.data[0]


@app.post("/posts/{post_id}/like", response_model=Posts)
def like_post(post_id: str):
    # Get current likes count
    current = supabase.table('posts').select(
        'likes').eq('id', post_id).execute()
    if not current.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Post with ID {post_id} not found")

    # Update likes count
    result = supabase.table('posts').update(
        {'likes': current.data[0]['likes'] + 1}).eq('id', post_id).execute()
    return result.data[0]


@app.post("/posts/{post_id}/view", response_model=Posts)
def view_post(post_id: str):
    # Get current views count
    current = supabase.table('posts').select(
        'views').eq('id', post_id).execute()
    if not current.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Post with ID {post_id} not found")

    # Update views count
    result = supabase.table('posts').update(
        {'views': current.data[0]['views'] + 1}).eq('id', post_id).execute()
    return result.data[0]


@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Posts"], summary="Delete a Post")
def delete_post(post_id: str, user_id: str = Body(...)):
    # Check if post exists and belongs to user
    post = supabase.table('posts').select('user_id').eq('id', post_id).single().execute()
    if not post.data or post.data['user_id'] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this post")
    supabase.table('posts').delete().eq('id', post_id).execute()
    return

@app.post("/users", response_model=User, tags=["Users"], summary="Create or update a user from Clerk info")
def upsert_user(user: UserCreate):
    # Try to upsert user by id
    result = supabase.table('users').upsert({
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'image_url': user.image_url
    }, on_conflict=['id']).execute()
    # Fetch the user (should be only one)
    user_row = supabase.table('users').select('*').eq('id', user.id).single().execute()
    return user_row.data