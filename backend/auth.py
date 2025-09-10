# auth.py

import os

import httpx
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

# این فایل مسئولیت احراز هویت کاربران را با استفاده از سرویس Clerk بر عهده دارد.

# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()

# خواندن تنظیمات Clerk از متغیرهای محیطی
CLERK_ISSUER = os.getenv("CLERK_ISSUER")  # آدرس صادرکننده توکن
CLERK_JWKS_URL = os.getenv(
    "CLERK_JWKS_URL", ""
)  # آدرس برای دریافت کلیدهای عمومی (JWKS)

# طرح احراز هویت Bearer برای دریافت توکن از هدر Authorization
bearer_scheme = HTTPBearer()


async def get_clerk_public_keys():
    """
    کلیدهای عمومی (Public Keys) را از Clerk دریافت می‌کند.
    این کلیدها برای تأیید امضای توکن JWT استفاده می‌شوند.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(CLERK_JWKS_URL)
        response.raise_for_status()  # اگر درخواست ناموفق بود، خطا ایجاد می‌کند
        return response.json()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    یک وابستگی (Dependency) در FastAPI که توکن کاربر را اعتبارسنجی کرده
    و اطلاعات (payload) آن را برمی‌گرداند.
    """
    token = credentials.credentials
    try:
        # دریافت کلیدهای عمومی از Clerk
        keys = await get_clerk_public_keys()
        # رمزگشایی و اعتبارسنجی توکن JWT
        payload = jwt.decode(
            token,
            keys,
            algorithms=["RS256"],  # الگوریتم امضا
            issuer=CLERK_ISSUER,  # بررسی صادرکننده توکن
        )
        # اگر توکن معتبر باشد، اطلاعات کاربر (payload) برگردانده می‌شود
        return payload
    except JWTError as e:
        # اگر توکن نامعتبر باشد، خطای 401 برگردانده می‌شود
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"اعتبارنامه نامعتبر است: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        # برای سایر خطاهای احتمالی
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطای داخلی سرور هنگام اعتبارسنجی توکن",
        )
