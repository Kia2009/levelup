import os
from typing import List, Optional

from auth import get_current_user
from dotenv import load_dotenv  # type: ignore
from fastapi import Body, Depends, FastAPI, HTTPException, status  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from schemas import Comment, CommentCreate, PostCreate, Posts, User
from supabase import Client, create_client  # type: ignore

load_dotenv()

app = FastAPI(
    title="post manager",
    description="A basic API to manage posts created by users.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
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
    result = (
        supabase.table("posts").select("*").order("created_at", desc=True).execute()
    )
    return result.data


@app.post(
    "/posts",
    response_model=Posts,
    status_code=status.HTTP_201_CREATED,
    tags=["Posts"],
    summary="Create a new post",
)
def create_post(post_create: PostCreate, user: dict = Depends(get_current_user)):
    """
    Create a post.
    - **title**: The title of the post (must be at least 3 characters).
    - **contains**: The message of the post (must be at least 3 characters).
    """
    result = (
        supabase.table("posts")
        .insert({
            "title": post_create.title,
            "contains": post_create.contains,
            "creator": user.get("name"),
            "user_id": user.get("sub"),
            "likes": [],  # Initialize with empty list
            "views": [],  # Initialize with empty list
        })
        .execute()
    )
    return result.data[0]


@app.get(
    "/posts/{post_id}",
    response_model=Posts,
    tags=["Posts"],
    summary="Get a single post by ID",
)
def get_post_by_id(post_id: int):
    """
    Retrieve a single post by its unique ID.
    """
    result = supabase.table("posts").select("*").eq("id", post_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {post_id} not found",
        )
    return result.data[0]


@app.post(
    "/posts/{post_id}/like", response_model=Posts, tags=["Posts"], summary="Like a post"
)
def like_post(post_id: str, user: dict = Depends(get_current_user)):
    """
    Like a specific post.
    """
    try:
        current_post_data = (
            supabase.table("posts").select("*").eq("id", post_id).execute()
        )
        if not current_post_data.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with ID {post_id} not found",
            )

        post = current_post_data.data[0]
        likes = post.get("likes", [])
        user_id = user.get("sub")

        if user_id not in likes:
            likes.append(user_id)
            # Update creator's coins if liked for the first time by this user
            creator_id = post["user_id"]
            creator_data = (
                supabase.table("users")
                .select("coins")
                .eq("user_id", creator_id)
                .execute()
            )
            if creator_data.data:
                current_coins = creator_data.data[0]["coins"]
                supabase.table("users").update({"coins": current_coins + 1}).eq(
                    "user_id", creator_id
                ).execute()

            updated_post_data = (
                supabase.table("posts")
                .update({"likes": likes})
                .eq("id", post_id)
                .execute()
            )
            return updated_post_data.data[0]
        else:
            return post  # Return existing post if already liked
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to like post: {str(e)}",
        )


@app.delete(
    "/posts/{post_id}/like",
    response_model=Posts,
    tags=["Posts"],
    summary="Unlike a post",
)
def delete_like_post(post_id: str, user: dict = Depends(get_current_user)):
    """
    Remove a like from a specific post.
    """
    current_post_data = supabase.table("posts").select("*").eq("id", post_id).execute()
    if not current_post_data.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {post_id} not found",
        )

    post = current_post_data.data[0]
    likes = post.get("likes", [])
    user_id = user.get("sub")

    if user_id in likes:
        likes.remove(user_id)
        # Decrease creator's coins
        creator_id = post["user_id"]
        creator_data = (
            supabase.table("users").select("coins").eq("user_id", creator_id).execute()
        )
        if creator_data.data:
            current_coins = creator_data.data[0]["coins"]
            if current_coins > 0:  # Ensure coins don't go below zero
                supabase.table("users").update({"coins": current_coins - 1}).eq(
                    "user_id", creator_id
                ).execute()

        updated_post_data = (
            supabase.table("posts").update({"likes": likes}).eq("id", post_id).execute()
        )
        return updated_post_data.data[0]
    else:
        return post  # Return existing post if not liked


@app.post(
    "/posts/{post_id}/view", response_model=Posts, tags=["Posts"], summary="View a post"
)
def view_post(post_id: str, user: dict = Depends(get_current_user)):
    """
    Record a view for a specific post.
    """
    current_post_data = (
        supabase.table("posts").select("views").eq("id", post_id).execute()
    )
    if not current_post_data.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {post_id} not found",
        )

    views = current_post_data.data[0].get("views", [])
    user_id = user.get("sub")

    if user_id not in views:
        views.append(user_id)
        result = (
            supabase.table("posts").update({"views": views}).eq("id", post_id).execute()
        )
        return result.data[0]
    else:
        # If user already viewed, return the current post data without modification
        # To get the full post data, we'd need another select, but for view count
        # it's usually fine to return what was fetched or the updated view count if needed.
        # For this response_model (Posts), let's fetch the full post to match the model.
        return get_post_by_id(int(post_id))


@app.delete(
    "/posts/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Posts"],
    summary="Delete a Post",
)
def delete_post(post_id: str, user: dict = Depends(get_current_user)):
    """
    Delete a specific post if the user is authorized.
    """
    post_data = (
        supabase.table("posts").select("user_id").eq("id", post_id).single().execute()
    )
    if not post_data.data or post_data.data["user_id"] != user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this post",
        )
    supabase.table("posts").delete().eq("id", post_id).execute()
    return


@app.post(
    "/posts/{post_id}/comments",
    response_model=Comment,
    status_code=status.HTTP_201_CREATED,
    tags=["Comments"],
    summary="Create a new comment for a post",
)
def create_comment(
    post_id: int, comment_create: CommentCreate, user: dict = Depends(get_current_user)
):
    """
    Create a comment for a specific post.
    - **content**: The content of the comment (must be at least 1 character).
    """
    post_exists = supabase.table("posts").select("id").eq("id", post_id).execute()
    if not post_exists.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {post_id} not found",
        )

    result = (
        supabase.table("comments")
        .insert({
            "post_id": post_id,
            "content": comment_create.content,
            "creator": user.get("name"),
            "user_id": user.get("sub"),
            "likes": [],
            "views": [],
        })
        .execute()
    )
    return result.data[0]


@app.get(
    "/posts/{post_id}/comments",
    response_model=List[Comment],
    tags=["Comments"],
    summary="Get all comments for a post",
)
def get_comments(post_id: int):
    """
    Retrieve all comments for a specific post, ordered by creation time.
    """
    result = (
        supabase.table("comments")
        .select("*")
        .eq("post_id", post_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@app.post(
    "/posts/{post_id}/comments/{comment_id}/like",
    response_model=Comment,
    tags=["Comments"],
    summary="Like a comment",
)
def like_comment(post_id: int, comment_id: int, user: dict = Depends(get_current_user)):
    """
    Like a specific comment.
    """
    current_comment_data = (
        supabase.table("comments")
        .select("*")
        .eq("id", comment_id)
        .eq("post_id", post_id)
        .execute()
    )
    if not current_comment_data.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with ID {comment_id} not found",
        )

    comment = current_comment_data.data[0]
    likes = comment.get("likes", [])
    user_id = user.get("sub")

    if user_id not in likes:
        likes.append(user_id)
        # Update creator's coins
        creator_id = comment["user_id"]
        creator_data = (
            supabase.table("users").select("coins").eq("user_id", creator_id).execute()
        )
        if creator_data.data:
            current_coins = creator_data.data[0]["coins"]
            supabase.table("users").update({"coins": current_coins + 1}).eq(
                "user_id", creator_id
            ).execute()

        result = (
            supabase.table("comments")
            .update({"likes": likes})
            .eq("id", comment_id)
            .execute()
        )
        return result.data[0]
    else:
        return comment  # Return existing comment if already liked


@app.delete(
    "/posts/{post_id}/comments/{comment_id}/like",
    response_model=Comment,
    tags=["Comments"],
    summary="Unlike a comment",
)
def delete_like_comment(
    post_id: int, comment_id: int, user: dict = Depends(get_current_user)
):
    """
    Remove a like from a specific comment.
    """
    current_comment_data = (
        supabase.table("comments")
        .select("*")
        .eq("id", comment_id)
        .eq("post_id", post_id)
        .execute()
    )
    if not current_comment_data.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with ID {comment_id} not found",
        )

    comment = current_comment_data.data[0]
    likes = comment.get("likes", [])
    user_id = user.get("sub")

    if user_id in likes:
        likes.remove(user_id)
        # Decrease creator's coins
        creator_id = comment["user_id"]
        creator_data = (
            supabase.table("users").select("coins").eq("user_id", creator_id).execute()
        )
        if creator_data.data:
            current_coins = creator_data.data[0]["coins"]
            if current_coins > 0:
                supabase.table("users").update({"coins": current_coins - 1}).eq(
                    "user_id", creator_id
                ).execute()

        result = (
            supabase.table("comments")
            .update({"likes": likes})
            .eq("id", comment_id)
            .execute()
        )
        return result.data[0]
    else:
        return comment  # Return existing comment if not liked


@app.post(
    "/posts/{post_id}/comments/{comment_id}/view",
    response_model=Comment,
    tags=["Comments"],
    summary="View a comment",
)
def view_comment(post_id: int, comment_id: int, user: dict = Depends(get_current_user)):
    """
    Record a view for a specific comment.
    """
    current_comment_data = (
        supabase.table("comments")
        .select("views")
        .eq("id", comment_id)
        .eq("post_id", post_id)
        .execute()
    )
    if not current_comment_data.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with ID {comment_id} not found",
        )

    views = current_comment_data.data[0].get("views", [])
    user_id = user.get("sub")

    if user_id not in views:
        views.append(user_id)
        result = (
            supabase.table("comments")
            .update({"views": views})
            .eq("id", comment_id)
            .execute()
        )
        return result.data[0]
    else:
        # Return the current comment data without modification if already viewed
        return current_comment_data.data[0]


@app.get(
    "/myposts", response_model=List[Posts], tags=["Posts"], summary="Get all Posts"
)
def get_my_posts(
    user: dict = Depends(get_current_user),
):
    """
    Retrieve a list of my posts currently in the database.
    """
    result = (
        supabase.table("posts")
        .select("*")
        .eq("user_id", user.get("sub"))
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@app.post("/newuser", response_model=User, tags=["User"], summary="Add a new User")
def new_user(user: dict = Depends(get_current_user)):
    """
    Add a new user to the database when they create an account.
    - user_id: The unique identifier from the authentication provider
    - coins: Initial coin balance (defaults to 0)
    """
    try:
        # Check if user already exists
        existing_user = (
            supabase.table("users").select("*").eq("user_id", user.get("sub")).execute()
        )

        if existing_user.data:
            return existing_user.data[0]

        # Create new user if doesn't exist
        result = (
            supabase.table("users")
            .insert({"user_id": user.get("sub"), "coins": 0})
            .execute()
        )
        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )


@app.get("/getcoins", response_model=int, tags=["User"], summary="Get User's coins")
def get_coins(user: dict = Depends(get_current_user)):
    """
    Retrieve the current coin balance for the authenticated user.
    """
    result = (
        supabase.table("users").select("coins").eq("user_id", user.get("sub")).execute()
    )
    if not result.data:
        return 0  # User not found in 'users' table, return 0 coins
    return result.data[0]["coins"]


@app.get(
    "/users/{user_id}/coins",
    response_model=int,
    tags=["User"],
    summary="Get coins for a specific user",
)
def get_user_coins(user_id: str):
    """
    Get coins for a specific user by their user_id.
    """
    result = supabase.table("users").select("coins").eq("user_id", user_id).execute()
    if not result.data:
        return 0
    return result.data[0]["coins"]
