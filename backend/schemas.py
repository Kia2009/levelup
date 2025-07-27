# schemas.py

from datetime import datetime
from typing import List
from pydantic import BaseModel, Field

# این فایل مدل‌های داده‌ای را تعریف می‌کند که برای اعتبارسنجی ورودی و خروجی API استفاده می‌شوند.
# Pydantic به صورت خودکار داده‌ها را اعتبارسنجی و تبدیل می‌کند.

class User(BaseModel):
    """مدل داده برای یک کاربر."""
    user_id: str  # شناسه منحصر به فرد کاربر (از Clerk)
    coins: int = 0  # تعداد سکه‌های کاربر، مقدار پیش‌فرض صفر است

class Comment(BaseModel):
    """مدل داده برای یک کامنت."""
    id: int  # شناسه کامنت
    post_id: int  # شناسه‌ی پستی که این کامنت به آن تعلق دارد
    user_id: str  # شناسه‌ی کاربری که کامنت را ایجاد کرده
    creator: str  # نام کاربری که کامنت را ایجاد کرده
    content: str  # محتوای کامنت
    created_at: datetime  # زمان ایجاد کامنت
    likes: List[str] = []  # لیستی از شناسه‌های کاربرانی که این کامنت را لایک کرده‌اند
    views: List[str] = []  # لیستی از شناسه‌های کاربرانی که این کامنت را مشاهده کرده‌اند

class CommentCreate(BaseModel):
    """مدل برای ایجاد یک کامنت جدید. فقط به محتوا نیاز دارد."""
    content: str = Field(..., min_length=1, description="محتوای کامنت")

class Posts(BaseModel):
    """مدل داده برای یک پست."""
    id: int  # شناسه پست
    created_at: datetime  # زمان ایجاد پست
    creator: str  # نام کاربری که پست را ایجاد کرده
    user_id: str  # شناسه کاربری که پست را ایجاد کرده
    title: str  # عنوان پست
    contains: str  # محتوای اصلی پست
    likes: List[str] = []  # لیستی از شناسه‌های کاربرانی که این پست را لایک کرده‌اند
    views: List[str] = []  # لیستی از شناسه‌های کاربرانی که این پست را مشاهده کرده‌اند

class PostCreate(BaseModel):
    """مدل برای ایجاد یک پست جدید. به عنوان و محتوا نیاز دارد."""
    title: str = Field(..., min_length=3, description="عنوان پست")
    contains: str = Field(..., min_length=3, description="محتوای پستی که کاربر می‌خواهد به اشتراک بگذارد.")
