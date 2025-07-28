# main.py

import os
from typing import List

# وارد کردن کتابخانه‌های مورد نیاز
from auth import get_current_user  # ماژول احراز هویت برای گرفتن اطلاعات کاربر فعلی
from dotenv import load_dotenv  # برای خواندن متغیرهای محیطی از فایل .env
from fastapi import (  # فریمورک اصلی برای ساخت API
    Depends,
    FastAPI,
    HTTPException,
    status,
)
from fastapi.middleware.cors import (
    CORSMiddleware,  # برای مدیریت درخواست‌های Cross-Origin
)
from schemas import (  # مدل‌های داده Pydantic
    Comment,
    CommentCreate,
    PostCreate,
    Posts,
    User,
)
from supabase import Client, create_client  # کلاینت برای ارتباط با Supabase

# بارگذاری متغیرهای محیطی
load_dotenv()

# نمونه‌سازی از FastAPI
app = FastAPI(
    title="مدیریت پست‌ها",
    description="یک API پایه برای مدیریت پست‌های ایجاد شده توسط کاربران.",
    version="1.0.0",
)

# تنظیمات CORS برای اجازه دادن به همه مبداها
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("VERCEL_URL")],  # Replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# راه‌اندازی کلاینت Supabase
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(url, key)


# یک تابع کمکی برای مدیریت افزایش/کاهش سکه کاربر
def _update_user_coins(user_id: str, amount: int):
    """سکه کاربر را بر اساس مقدار داده شده افزایش یا کاهش می‌دهد."""
    try:
        # فراخوانی یک تابع در پایگاه داده برای به‌روزرسانی سکه‌ها به صورت اتمی
        supabase.rpc(
            "update_coins", {"user_id_in": user_id, "amount": amount}
        ).execute()
    except Exception as e:
        # در صورت بروز خطا، آن را لاگ می‌گیریم ولی برنامه متوقف نمی‌شود
        print(f"خطا در به‌روزرسانی سکه برای کاربر {user_id}: {e}")


@app.get("/", tags=["عمومی"], summary="نقطه شروع API")
def read_root():
    """یک پیام خوش‌آمدگویی ساده برای تایید اجرای API."""
    return {"message": "به Post API خوش آمدید! برای مستندات به /docs مراجعه کنید."}


# --- بخش مدیریت پست‌ها ---


@app.get(
    "/posts", response_model=List[Posts], tags=["پست‌ها"], summary="دریافت تمام پست‌ها"
)
def get_all_posts():
    """لیستی از تمام پست‌های موجود در پایگاه داده را بازیابی می‌کند."""
    result = (
        supabase.table("posts").select("*").order("created_at", desc=True).execute()
    )
    return result.data


@app.post(
    "/posts",
    response_model=Posts,
    status_code=status.HTTP_201_CREATED,
    tags=["پست‌ها"],
    summary="ایجاد یک پست جدید",
)
def create_post(post_create: PostCreate, user: dict = Depends(get_current_user)):
    """
    یک پست جدید ایجاد می‌کند.
    - **title**: عنوان پست (حداقل ۳ کاراکتر).
    - **contains**: محتوای پست (حداقل ۳ کاراکتر).
    """
    result = (
        supabase.table("posts")
        .insert({
            "title": post_create.title,
            "contains": post_create.contains,
            "creator": user.get("name"),
            "user_id": user.get("sub"),
            "likes": [],
            "views": [],
        })
        .execute()
    )
    return result.data[0]


@app.get(
    "/posts/{post_id}",
    response_model=Posts,
    tags=["پست‌ها"],
    summary="دریافت یک پست با شناسه",
)
def get_post_by_id(post_id: int):
    """یک پست را با شناسه منحصر به فرد آن بازیابی می‌کند."""
    result = supabase.table("posts").select("*").eq("id", post_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"پستی با شناسه {post_id} یافت نشد",
        )
    return result.data


@app.post(
    "/posts/{post_id}/like",
    response_model=Posts,
    tags=["پست‌ها"],
    summary="لایک کردن یک پست",
)
def like_post(post_id: int, user: dict = Depends(get_current_user)):
    """یک پست مشخص را لایک می‌کند."""
    user_id = user.get("sub")

    # ابتدا پست را پیدا می‌کنیم
    post_res = (
        supabase.table("posts")
        .select("likes, user_id")
        .eq("id", post_id)
        .single()
        .execute()
    )
    if not post_res.data:
        raise HTTPException(status_code=404, detail="پست یافت نشد")

    post = post_res.data
    likes = post.get("likes", [])

    # اگر کاربر قبلا لایک نکرده باشد
    if user_id not in likes:
        likes.append(user_id)
        # به نویسنده پست یک سکه اضافه می‌کنیم
        _update_user_coins(post["user_id"], 1)
        # لیست لایک‌ها را به‌روز می‌کنیم
        updated_post = (
            supabase.table("posts").update({"likes": likes}).eq("id", post_id).execute()
        )
        return updated_post.data[0]

    # اگر قبلا لایک کرده، خود پست را برمی‌گردانیم
    return get_post_by_id(post_id)


@app.delete(
    "/posts/{post_id}/like",
    response_model=Posts,
    tags=["پست‌ها"],
    summary="برداشتن لایک یک پست",
)
def delete_like_post(post_id: int, user: dict = Depends(get_current_user)):
    """لایک یک پست مشخص را برمی‌دارد."""
    user_id = user.get("sub")

    post_res = (
        supabase.table("posts")
        .select("likes, user_id")
        .eq("id", post_id)
        .single()
        .execute()
    )
    if not post_res.data:
        raise HTTPException(status_code=404, detail="پست یافت نشد")

    post = post_res.data
    likes = post.get("likes", [])

    if user_id in likes:
        likes.remove(user_id)
        # از نویسنده پست یک سکه کم می‌کنیم
        _update_user_coins(post["user_id"], -1)
        updated_post = (
            supabase.table("posts").update({"likes": likes}).eq("id", post_id).execute()
        )
        return updated_post.data[0]

    return get_post_by_id(post_id)


@app.post(
    "/posts/{post_id}/view",
    response_model=Posts,
    tags=["پست‌ها"],
    summary="مشاهده یک پست",
)
def view_post(post_id: int, user: dict = Depends(get_current_user)):
    """یک بازدید برای پست ثبت می‌کند."""
    user_id = user.get("sub")

    post_res = (
        supabase.table("posts").select("views").eq("id", post_id).single().execute()
    )
    if not post_res.data:
        raise HTTPException(status_code=404, detail="پست یافت نشد")

    views = post_res.data.get("views", [])

    if user_id not in views:
        views.append(user_id)
        supabase.table("posts").update({"views": views}).eq("id", post_id).execute()

    return get_post_by_id(post_id)


@app.delete(
    "/posts/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["پست‌ها"],
    summary="حذف یک پست",
)
def delete_post(post_id: int, user: dict = Depends(get_current_user)):
    """یک پست مشخص را در صورتی که کاربر مالک آن باشد حذف می‌کند."""
    post_data = (
        supabase.table("posts").select("user_id").eq("id", post_id).single().execute()
    )
    if not post_data.data or post_data.data["user_id"] != user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما اجازه حذف این پست را ندارید",
        )
    supabase.table("posts").delete().eq("id", post_id).execute()
    return


# --- بخش مدیریت کامنت‌ها ---


@app.get(
    "/posts/{post_id}/comments",
    response_model=List[Comment],
    tags=["کامنت‌ها"],
    summary="دریافت تمام کامنت‌های یک پست",
)
def get_comments(post_id: int):
    """تمام کامنت‌های یک پست را به ترتیب زمان ایجاد بازیابی می‌کند."""
    result = (
        supabase.table("comments")
        .select("*")
        .eq("post_id", post_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@app.post(
    "/posts/{post_id}/comments",
    response_model=Comment,
    status_code=status.HTTP_201_CREATED,
    tags=["کامنت‌ها"],
    summary="ایجاد کامنت برای یک پست",
)
def create_comment(
    post_id: int, comment_create: CommentCreate, user: dict = Depends(get_current_user)
):
    """یک کامنت برای پست مشخص ایجاد می‌کند."""
    # بررسی وجود پست
    post_exists = (
        supabase.table("posts").select("id").eq("id", post_id).single().execute()
    )
    if not post_exists.data:
        raise HTTPException(status_code=404, detail=f"پستی با شناسه {post_id} یافت نشد")

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


@app.post(
    "/posts/{post_id}/comments/{comment_id}/like",
    response_model=Comment,
    tags=["کامنت‌ها"],
    summary="لایک کردن یک کامنت",
)
def like_comment(comment_id: int, user: dict = Depends(get_current_user)):
    """یک کامنت مشخص را لایک می‌کند."""
    user_id = user.get("sub")

    comment_res = (
        supabase.table("comments")
        .select("likes, user_id")
        .eq("id", comment_id)
        .single()
        .execute()
    )
    if not comment_res.data:
        raise HTTPException(status_code=404, detail="کامنت یافت نشد")

    comment = comment_res.data
    likes = comment.get("likes", [])

    if user_id not in likes:
        likes.append(user_id)
        _update_user_coins(comment["user_id"], 1)
        updated_comment = (
            supabase.table("comments")
            .update({"likes": likes})
            .eq("id", comment_id)
            .execute()
        )
        return updated_comment.data[0]

    full_comment = (
        supabase.table("comments").select("*").eq("id", comment_id).single().execute()
    )
    return full_comment.data


@app.delete(
    "/posts/{post_id}/comments/{comment_id}/like",
    response_model=Comment,
    tags=["کامنت‌ها"],
    summary="برداشتن لایک یک کامنت",
)
def delete_like_comment(comment_id: int, user: dict = Depends(get_current_user)):
    """لایک یک کامنت مشخص را برمی‌دارد."""
    user_id = user.get("sub")

    comment_res = (
        supabase.table("comments")
        .select("likes, user_id")
        .eq("id", comment_id)
        .single()
        .execute()
    )
    if not comment_res.data:
        raise HTTPException(status_code=404, detail="کامنت یافت نشد")

    comment = comment_res.data
    likes = comment.get("likes", [])

    if user_id in likes:
        likes.remove(user_id)
        _update_user_coins(comment["user_id"], -1)
        updated_comment = (
            supabase.table("comments")
            .update({"likes": likes})
            .eq("id", comment_id)
            .execute()
        )
        return updated_comment.data[0]

    full_comment = (
        supabase.table("comments").select("*").eq("id", comment_id).single().execute()
    )
    return full_comment.data


# --- بخش مدیریت کاربر ---


@app.get(
    "/myposts", response_model=List[Posts], tags=["کاربر"], summary="دریافت پست‌های من"
)
def get_my_posts(user: dict = Depends(get_current_user)):
    """لیست پست‌هایی که توسط کاربر فعلی ایجاد شده را بازیابی می‌کند."""
    result = (
        supabase.table("posts")
        .select("*")
        .eq("user_id", user.get("sub"))
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@app.post("/newuser", response_model=User, tags=["کاربر"], summary="افزودن کاربر جدید")
def new_user(user: dict = Depends(get_current_user)):
    """
    یک کاربر جدید به پایگاه داده اضافه می‌کند. اگر کاربر وجود داشته باشد، اطلاعاتش را برمی‌گرداند.
    """
    user_id = user.get("sub")

    # بررسی وجود کاربر
    existing_user = supabase.table("users").select("*").eq("user_id", user_id).execute()
    if existing_user.data:
        return existing_user.data[0]

    # ایجاد کاربر جدید
    new_user_data = {"user_id": user_id, "coins": 0}
    result = supabase.table("users").insert(new_user_data).execute()
    return result.data[0]


@app.get("/getcoins", response_model=int, tags=["کاربر"], summary="دریافت سکه‌های کاربر")
def get_coins(user: dict = Depends(get_current_user)):
    """تعداد سکه‌های کاربر احراز هویت شده را بازیابی می‌کند."""
    result = (
        supabase.table("users")
        .select("coins")
        .eq("user_id", user.get("sub"))
        .single()
        .execute()
    )
    if not result.data:
        return 0  # اگر کاربر در جدول نبود، صفر برگردان
    return result.data.get("coins", 0)


@app.get(
    "/users/{user_id}/coins",
    response_model=int,
    tags=["کاربر"],
    summary="دریافت سکه‌های یک کاربر خاص",
)
def get_user_coins(user_id: str):
    """تعداد سکه‌های یک کاربر خاص را با شناسه او بازیابی می‌کند."""
    result = (
        supabase.table("users")
        .select("coins")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        return 0
    return result.data.get("coins", 0)
