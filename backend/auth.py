import os
import httpx
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt

load_dotenv()

CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")  # URL to fetch JWKS
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE")  # معمولاً client_id

bearer_scheme = HTTPBearer()


async def get_clerk_public_keys():
    async with httpx.AsyncClient() as client:
        resp = await client.get(CLERK_JWKS_URL)
        return resp.json()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials
    keys = await get_clerk_public_keys()
    try:
        payload = jwt.decode(
            token,
            keys,
            algorithms=["RS256"],
            audience=CLERK_AUDIENCE,
            issuer=CLERK_ISSUER,
        )
        return payload  # اطلاعات کاربر اینجاست
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
