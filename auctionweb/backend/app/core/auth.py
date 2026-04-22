from fastapi import Header, HTTPException, Request
from jose import jwt, JWTError
from app.core.config import SECRET_KEY, ALGORITHM
from app.i18n import _


async def get_current_user_id_from_token(
    request: Request,
    Authorization: str = Header(...)
):
        if not Authorization.startswith("Bearer"):
            raise HTTPException(status_code=401, detail=_("Invalid authorization header", request))
        token = Authorization.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(status_code=401, detail=_("User ID not found in token", request))
            return user_id
        except JWTError:
            raise HTTPException(status_code=401, detail=_("Invalid token", request))
