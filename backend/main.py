# main.py

import mimetypes
import os
import uuid
from typing import List, Optional

# وارد کردن کتابخانههای مورد نیاز
# وارد کردن ماژول‌ها و تنظیمات
# ماژول احراز هویت برای گرفتن اطلاعات کاربر فعلی
from auth import get_current_user
from dotenv import load_dotenv  # برای خواندن متغیرهای محیطی از فایل .env
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import (
    CORSMiddleware,
)
from pydantic import BaseModel
from schemas import (
    AdminUser,
    Comment,
    CommentCreate,
    LeaderboardEntry,
    PostCreate,
    Posts,
    Product,
    ProductCreate,
    Purchase,
    User,
)
from supabase import Client, create_client

# نمونهسازی از FastAPI
app = FastAPI(
    title="مدیریت پستها",
    description="یک API پایه برای مدیریت پستهای ایجاد شده توسط کاربران.",
    version="1.0.0",
)

# پیکربندی CORS برای اجازه دادن به درخواستها از دامنههای مشخص
app.add_middleware(
    CORSMiddleware,
    # Replace with your Vercel URL
    allow_origins=[os.environ.get("VERCEL_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# راهاندازی کلاینت Supabase
# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()

# راهاندازی کلاینت Supabase
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(url, key)

# Note: ADMIN_EMAILS may be changed in the environment; fetch at runtime in _is_admin


class AddCoinsRequest(BaseModel):
    amount: int


# یک تابع کمکی برای مدیریت افزایش/کاهش سکه کاربر
def _update_user_coins(user_id: str, amount: int):
    """سکه کاربر را بر اساس مقدار داده شده افزایش یا کاهش میدهد.

    اگر به‌روزرسانی با خطا مواجه شود، یک HTTPException پرتاب می‌شود.
    """
    try:
        rpc_res = supabase.rpc(
            "update_coins", {"user_id_in": user_id, "amount": amount}
        ).execute()
        # بررسی اینکه آیا rpc خطا برگردانده
        if getattr(rpc_res, "error", None):
            raise Exception(
                getattr(rpc_res, "error").get("message", "RPC update_coins error")
            )

        # خواندن موجودی نهایی
        result = (
            supabase.table("users")
            .select("coins")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        coins = None
        if result and getattr(result, "data", None):
            coins = result.data.get("coins")

        if coins is not None and coins < 0:
            # rollback
            supabase.rpc(
                "update_coins", {"user_id_in": user_id, "amount": -amount}
            ).execute()
            raise HTTPException(status_code=400, detail="موجودی سکه کافی نیست")
    except HTTPException:
        raise
    except Exception as e:
        print(f"خطا در به‌روزرسانی سکه برای کاربر {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"خطا در به‌روزرسانی سکه: {str(e)}")


def _is_admin(user: dict) -> bool:  # noqa: C901
    """بررسی میکند که آیا کاربر ادمین است یا نه"""
    if not user:
        return False

    # Extract emails from various possible fields in Clerk JWT payload
    user_emails = set()

    raw = os.environ.get("ADMIN_EMAILS", "") or ""
    # Support comma or semicolon separated lists
    split_chars = [",", ";"]
    admin_list = [raw]
    for ch in split_chars:
        parts = []
        for piece in admin_list:
            parts.extend(list(piece.split(ch)))
        admin_list = parts

    admin_entries = [e.strip() for e in admin_list if e and e.strip()]
    admin_emails_lower = [e.lower() for e in admin_entries if "@" in e]
    # treat non-email entries as possible Clerk user ids
    admin_ids = [e for e in admin_entries if "@" not in e]

    field = "email"
    value = user.get(field)
    user_emails.add(value.strip().lower()) # pyright: ignore[reportOptionalMemberAccess]

    # Read admin emails from environment each time so changes take effect without restarting  # noqa: E501

    # If any extracted user email matches admin emails, or user sub matches admin id, allow  # noqa: E501
    if any(email in admin_emails_lower for email in user_emails):
        return True

    user_sub = (user.get("sub") or "").strip()
    if user_sub in admin_ids:
        return True

    return False


@app.get("/admin/check", tags=["ادمین"], summary="بررسی ادمین (debug)")
def admin_check(user: dict = Depends(get_current_user)):  # noqa: C901
    """بازمی‌گرداند: payload توکن فعلی، ایمیل‌های استخراج شده و لیست ADMIN_EMAILS برای دیباگ."""  # noqa: E501
    # Extract emails using the same logic as _is_admin
    user_emails = set()

    email_fields = [
        "email",
        "email_address",
        "primary_email",
        "emailAddress",
        "primary_email_address",
        "email_addresses",
    ]

    for field in email_fields:
        value = user.get(field)
        if isinstance(value, str) and value.strip():
            user_emails.add(value.strip().lower())
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, str) and item.strip():
                    user_emails.add(item.strip().lower())
                elif isinstance(item, dict):
                    for nested_field in ["email_address", "email"]:
                        nested_email = item.get(nested_field)
                        if isinstance(nested_email, str) and nested_email.strip():
                            user_emails.add(nested_email.strip().lower())

    # read raw env and normalize similarly to _is_admin
    raw = os.environ.get("ADMIN_EMAILS", "") or ""
    admin_list = [raw]
    for ch in [",", ";"]:
        parts = []
        for piece in admin_list:
            parts.extend(list(piece.split(ch)))
        admin_list = parts
    admin_entries = [e.strip() for e in admin_list if e and e.strip()]
    admin_emails = [e for e in admin_entries if "@" in e]
    admin_emails_lower = [e.lower() for e in admin_emails]
    admin_ids = [e for e in admin_entries if "@" not in e]
    user_sub = (user.get("sub") or "").strip()

    return {
        "payload": user,
        "extracted_emails": list(user_emails),
        "admin_emails_from_env": admin_emails,
        "admin_emails_lower": admin_emails_lower,
        "admin_ids_from_env": admin_ids,
        "user_sub": user_sub,
        "is_admin": _is_admin(user),
        "matches": [email for email in user_emails if email in admin_emails_lower],
    }


@app.get("/", tags=["عمومی"], summary="نقطه شروع API")
def read_root():
    """یک پیام خوشآمدگویی ساده برای تایید اجرای API."""
    return {"message": "به Post API خوش آمدید! برای مستندات به /docs مراجعه کنید."}


# --- بخش مدیریت پستها ---


@app.get(
    "/posts", response_model=List[Posts], tags=["پستها"], summary="دریافت تمام پستها"
)
def get_all_posts():
    """لیستی از تمام پستهای موجود در پایگاه داده را بازیابی میکند."""
    result = (
        supabase.table("posts").select("*").order("created_at", desc=True).execute()
    )
    return result.data


@app.post(
    "/posts",
    response_model=Posts,
    status_code=status.HTTP_201_CREATED,
    tags=["پستها"],
    summary="ایجاد یک پست جدید",
)
def create_post(post_create: PostCreate, user: dict = Depends(get_current_user)):
    """
    یک پست جدید ایجاد میکند.
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
    tags=["پستها"],
    summary="دریافت یک پست با شناسه",
)
def get_post_by_id(post_id: int):
    """یک پست را با شناسه منحصر به فرد آن بازیابی میکند."""
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
    tags=["پستها"],
    summary="لایک کردن یک پست",
)
def like_post(post_id: int, user: dict = Depends(get_current_user)):
    """یک پست مشخص را لایک میکند."""
    user_id = user.get("sub")

    # ابتدا پست را پیدا میکنیم
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
        # به نویسنده پست یک سکه اضافه میکنیم
        _update_user_coins(post["user_id"], 1)
        # لیست لایکها را بهروز میکنیم
        updated_post = (
            supabase.table("posts").update({"likes": likes}).eq("id", post_id).execute()
        )
        return updated_post.data[0]

    # اگر قبلا لایک کرده، خود پست را برمیگردانیم
    return get_post_by_id(post_id)


@app.delete(
    "/posts/{post_id}/like",
    response_model=Posts,
    tags=["پستها"],
    summary="برداشتن لایک یک پست",
)
def delete_like_post(post_id: int, user: dict = Depends(get_current_user)):
    """لایک یک پست مشخص را برمیدارد."""
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
        # از نویسنده پست یک سکه کم میکنیم
        _update_user_coins(post["user_id"], -1)
        updated_post = (
            supabase.table("posts").update({"likes": likes}).eq("id", post_id).execute()
        )
        return updated_post.data[0]

    return get_post_by_id(post_id)


@app.post(
    "/posts/{post_id}/view",
    response_model=Posts,
    tags=["پستها"],
    summary="مشاهده یک پست",
)
def view_post(post_id: int, user: dict = Depends(get_current_user)):
    """یک بازدید برای پست ثبت میکند."""
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
    tags=["پستها"],
    summary="حذف یک پست",
)
def delete_post(post_id: int, user: dict = Depends(get_current_user)):
    """یک پست مشخص را در صورتی که کاربر مالک آن باشد حذف میکند."""
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


# --- بخش مدیریت کامنتها ---


@app.get(
    "/posts/{post_id}/comments",
    response_model=List[Comment],
    tags=["کامنتها"],
    summary="دریافت تمام کامنتهای یک پست",
)
def get_comments(post_id: int):
    """تمام کامنتهای یک پست را به ترتیب زمان ایجاد بازیابی میکند."""
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
    tags=["کامنتها"],
    summary="ایجاد کامنت برای یک پست",
)
def create_comment(
    post_id: int, comment_create: CommentCreate, user: dict = Depends(get_current_user)
):
    """یک کامنت برای پست مشخص ایجاد میکند."""
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
    tags=["کامنتها"],
    summary="لایک کردن یک کامنت",
)
def like_comment(comment_id: int, user: dict = Depends(get_current_user)):
    """یک کامنت مشخص را لایک میکند."""
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
    tags=["کامنتها"],
    summary="برداشتن لایک یک کامنت",
)
def delete_like_comment(comment_id: int, user: dict = Depends(get_current_user)):
    """لایک یک کامنت مشخص را برمیدارد."""
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


@app.post(
    "/posts/{post_id}/comments/{comment_id}/view",
    response_model=Comment,
    tags=["کامنتها"],
    summary="مشاهده یک کامنت",
)
def view_comment(comment_id: int, user: dict = Depends(get_current_user)):
    """یک بازدید برای کامنت ثبت میکند."""
    user_id = user.get("sub")

    comment_res = (
        supabase.table("comments")
        .select("views")
        .eq("id", comment_id)
        .single()
        .execute()
    )
    if not comment_res.data:
        raise HTTPException(status_code=404, detail="کامنت یافت نشد")

    views = comment_res.data.get("views", [])

    if user_id not in views:
        views.append(user_id)
        supabase.table("comments").update({"views": views}).eq(
            "id", comment_id
        ).execute()

    full_comment = (
        supabase.table("comments").select("*").eq("id", comment_id).single().execute()
    )
    return full_comment.data


# --- بخش فروشگاه ---


@app.get(
    "/shop/products",
    response_model=List[Product],
    tags=["فروشگاه"],
    summary="دریافت تمام محصولات فروشگاه",
)
def get_products():
    """لیست تمام محصولات موجود در فروشگاه را بازیابی میکند."""
    result = (
        supabase.table("products").select("*").order("created_at", desc=True).execute()
    )
    return result.data


@app.post(
    "/shop/upload",
    tags=["فروشگاه"],
    summary="آپلود فایل به استوریج",
)
async def upload_file(
    file: UploadFile = File(...), user: dict = Depends(get_current_user)
):
    """فایل را به Supabase Storage آپلود میکند."""
    try:
        # بررسی نوع فایل
        allowed_types = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "application/zip",
            "application/x-rar-compressed",
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="نوع فایل مجاز نیست. فقط PDF, Word, Text, ZIP و RAR پذیرفته میشود.",  # noqa: E501
            )

        # بررسی حجم فایل (حداکثر 50MB)
        file_content = await file.read()
        if len(file_content) > 50 * 1024 * 1024:
            raise HTTPException(
                status_code=400, detail="حجم فایل نباید بیشتر از 50 مگابایت باشد."
            )

        # ایجاد نام منحصر به فرد برای فایل
        # pyright: ignore[reportOptionalMemberAccess, reportOperatorIssue]
        file_extension = (
            file.filename.split(  # pyright: ignore[reportOptionalMemberAccess]
                "."
            )[-1]
            if "." in file.filename  # pyright: ignore[reportOperatorIssue]
            else ""
        )  # pyright: ignore[reportOperatorIssue]
        unique_filename = f"{user.get('sub')}/{uuid.uuid4()}.{file_extension}"

        # آپلود به Supabase Storage
        try:
            result = supabase.storage.from_("notebooks").upload(
                unique_filename, file_content, {"content-type": file.content_type}
            )

        except Exception as e:
            raise HTTPException(status_code=501, detail=f"خطا در آپلود فایل: {str(e)}")

        # دریافت URL عمومی فایل
        public_url = supabase.storage.from_("notebooks").get_public_url(unique_filename)

        return {
            "file_url": public_url,
            "filename": file.filename,
            "size": len(file_content),
            "upload_progress": 100,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در آپلود فایل: {str(e)}")


@app.post(
    "/shop/products",
    response_model=Product,
    status_code=status.HTTP_201_CREATED,
    tags=["فروشگاه"],
    summary="ایجاد محصول جدید",
)
def create_product(
    product_create: ProductCreate, user: dict = Depends(get_current_user)
):
    """محصول جدید برای فروش ایجاد میکند."""
    result = (
        supabase.table("products")
        .insert({
            "seller_id": user.get("sub"),
            "seller_name": user.get("name"),
            "title": product_create.title,
            "description": product_create.description,
            "price": product_create.price,
            "file_url": product_create.file_url,
        })
        .execute()
    )
    return result.data[0]


@app.post(
    "/shop/products/{product_id}/buy",
    tags=["فروشگاه"],
    summary="خرید محصول",
)
def buy_product(product_id: int, user: dict = Depends(get_current_user)):
    """محصول مشخص را خریداری میکند."""
    user_id = user.get("sub")

    # بررسی وجود محصول
    product_res = (
        supabase.table("products").select("*").eq("id", product_id).single().execute()
    )
    if not product_res.data:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")

    product = product_res.data

    # کاربر نباید بتواند محصول خودش را بخرد
    if product.get("seller_id") == user_id:
        raise HTTPException(status_code=400, detail="نمی‌توانید محصول خودتان را بخرید")

    # بررسی اینکه کاربر قبلا این محصول را نخریده باشد
    existing_purchase = (
        supabase.table("purchases")
        .select("id")
        .eq("buyer_id", user_id)
        .eq("product_id", product_id)
        .execute()
    )
    if existing_purchase.data:
        raise HTTPException(status_code=400, detail="شما قبلا این محصول را خریدهاید")

    # بررسی موجودی سکه کاربر
    user_coins_res = (
        supabase.table("users")
        .select("coins")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not user_coins_res.data or user_coins_res.data["coins"] < product["price"]:
        raise HTTPException(status_code=400, detail="موجودی سکه کافی نیست")

    # انجام انتقال سکه‌ها با rollback در صورت خطا
    try:
        # کسر از خریدار
        # pyright: ignore[reportArgumentType]
        _update_user_coins(user_id, -product["price"])  # pyright: ignore[reportArgumentType]

        # اضافه کردن به فروشنده
        _update_user_coins(product["seller_id"], product["price"])

        # ثبت خرید
        purchase_result = (
            supabase.table("purchases")
            .insert({
                "buyer_id": user_id,
                "product_id": product_id,
            })
            .execute()
        )

        return {
            "message": "خرید با موفقیت انجام شد",
            "purchase_id": purchase_result.data[0]["id"],
        }
    except Exception as e:
        # تلاش برای rollback در صورت کسر سکه از خریدار اما خطا در ادامه
        try:
            # اگر از خریدار کسر شده باشد، سعی کن آن را برگردانی (افزایش مقدار)
            _update_user_coins(user_id, product["price"])  # pyright: ignore[reportArgumentType] # بازگردانی کسر
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"خطا در فرایند خرید: {str(e)}")


@app.get(
    "/shop/products/{product_id}/stats",
    tags=["فروشگاه"],
    summary="آمار محصول (تعداد خریداران)",
)
def product_stats(product_id: int):
    """تعداد خریدهای یک محصول را برمی‌گرداند."""
    # بررسی وجود محصول
    product_res = (
        supabase.table("products").select("*").eq("id", product_id).single().execute()
    )
    if not product_res.data:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")

    purchases_res = (
        supabase.table("purchases").select("id").eq("product_id", product_id).execute()
    )
    purchase_count = len(purchases_res.data) if purchases_res.data else 0

    return {
        "product_id": product_id,
        "purchase_count": purchase_count,
    }


@app.get(
    "/shop/my-library",
    response_model=List[Purchase],
    tags=["فروشگاه"],
    summary="دریافت کتابخانه کاربر",
)
def get_my_library(user: dict = Depends(get_current_user)):
    """لیست محصولات خریداری شده توسط کاربر را بازیابی میکند."""
    user_id = user.get("sub")

    # دریافت خریدها همراه با اطلاعات محصول
    result = (
        supabase.table("purchases")
        .select("*, products(*)")
        .eq("buyer_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    # تبدیل به فرمت مورد نظر
    library_items = []
    for purchase in result.data:
        library_items.append({"product": purchase["products"]})

    return library_items


# --- بخش لیدربورد ---


@app.get(
    "/leaderboard",
    response_model=List[LeaderboardEntry],
    tags=["لیدربورد"],
    summary="دریافت لیدربورد",
)
def get_leaderboard(limit: int = 10):
    """لیدربورد کاربران با بیشترین سکه را بازیابی میکند."""
    # سادگی: از جدول users بالاترین سکه‌ها را گرفته و تبدیل به فرمت مورد نیاز می‌کنیم
    result = (
        supabase.table("users")
        .select("user_id, coins")
        .order("coins", desc=True)
        .limit(limit)
        .execute()
    )
    data = result.data or []
    leaderboard = []
    for idx, u in enumerate(data, start=1):
        leaderboard.append({
            "user_id": u.get("user_id"),
            "coins": u.get("coins", 0),
            "rank": idx,
        })
    return leaderboard


# --- بخش مدیریت کاربر ---


@app.get(
    "/myposts", response_model=List[Posts], tags=["کاربر"], summary="دریافت پستهای من"
)
def get_my_posts(user: dict = Depends(get_current_user)):
    """لیست پستهایی که توسط کاربر فعلی ایجاد شده را بازیابی میکند."""
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
    یک کاربر جدید به پایگاه داده اضافه میکند. اگر کاربر وجود داشته باشد، اطلاعاتش را برمیگرداند.
    """  # noqa: E501
    user_id = user.get("sub")

    # بررسی وجود کاربر
    existing_user = supabase.table("users").select("*").eq("user_id", user_id).execute()
    if existing_user.data:
        return existing_user.data[0]

    # ایجاد کاربر جدید
    new_user_data = {"user_id": user_id, "name": user.get("name"), "coins": 0}
    result = supabase.table("users").insert(new_user_data).execute()
    return result.data[0]


@app.get("/getcoins", response_model=int, tags=["کاربر"], summary="دریافت سکههای کاربر")
def get_coins(user: dict = Depends(get_current_user)):
    """تعداد سکههای کاربر احراز هویت شده را بازیابی میکند."""
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
    summary="دریافت سکههای یک کاربر خاص",
)
def get_user_coins(user_id: str):
    """تعداد سکههای یک کاربر خاص را با شناسه او بازیابی میکند."""
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


# --- بخش پنل ادمین ---


@app.get(
    "/admin/users",
    response_model=List[AdminUser],
    tags=["ادمین"],
    summary="دریافت لیست کاربران (فقط ادمین)",
)
def get_all_users(user: dict = Depends(get_current_user)):
    """لیست تمام کاربران را برای ادمین بازیابی میکند."""
    if not _is_admin(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="فقط ادمینها به این بخش دسترسی دارند",
        )

    result = supabase.table("users").select("*").order("coins", desc=True).execute()
    return result.data


@app.post(
    "/admin/users/{target_user_id}/coins",
    tags=["ادمین"],
    summary="اضافه کردن سکه به کاربر (فقط ادمین)",
)
def add_coins_to_user(
    target_user_id: str,
    request: AddCoinsRequest,
    user: dict = Depends(get_current_user),
):
    """سکه به کاربر مشخص اضافه میکند (فقط ادمین)."""
    if not _is_admin(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="فقط ادمینها به این بخش دسترسی دارند",
        )

    amount = request.amount
    if amount <= 0:
        raise HTTPException(status_code=400, detail="مقدار سکه باید مثبت باشد")

    # بررسی وجود کاربر
    target_user = (
        supabase.table("users")
        .select("user_id")
        .eq("user_id", target_user_id)
        .single()
        .execute()
    )
    if not target_user.data:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")

    # Safe, explicit update instead of calling the `update_coins` RPC
    # which can be ambiguous if Postgres has overloaded functions with
    # different parameter types. We read the current coins, compute the
    # new total and update the row directly.
    try:
        current_res = (
            supabase.table("users")
            .select("coins")
            .eq("user_id", target_user_id)
            .single()
            .execute()
        )
        if not current_res.data:
            raise HTTPException(status_code=404, detail="کاربر یافت نشد")

        current_coins = current_res.data.get("coins", 0) or 0
        new_coins = current_coins + amount

        update_res = (
            supabase.table("users")
            .update({"coins": new_coins})
            .eq("user_id", target_user_id)
            .execute()
        )
        if getattr(update_res, "error", None):
            raise Exception(getattr(update_res, "error").get("message", "unknown"))

        return {
            "message": f"{amount} سکه به کاربر {target_user_id} اضافه شد",
            "new_coins": new_coins,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"خطا در اضافه کردن سکه به {target_user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"خطا در اضافه کردن سکه: {str(e)}")
