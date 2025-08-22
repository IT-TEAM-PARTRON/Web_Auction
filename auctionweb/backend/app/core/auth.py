from fastapi import Header, HTTPException
from jose import jwt, JWTError
from app.core.config import SECRET_KEY, ALGORITHM


async def get_current_user_id_from_token(Authorization: str = Header(...)):
        if not Authorization.startswith("Bearer"):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        token = Authorization.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(status_code=401, detail="User ID not found in token")
            return user_id
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")