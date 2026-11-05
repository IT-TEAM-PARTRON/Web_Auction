# app/main.py
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.v1 import router as api_v1_router
from app.tasks.auto_approve import start_auto_set_winner_task
from app.i18n import _
from app.core.config import (
    UPLOAD_ROOT_DIR,
    ensure_upload_dirs,
    connect_smb_share_if_needed,
)


class SafeStaticFiles(StaticFiles):
    """
    StaticFiles handler phục vụ trực tiếp từ UPLOAD_ROOT_DIR.
    check_dir=False và follow_symlink=True để tương thích với Windows UNC và không crash khi khởi động.
    """
    def __init__(self, directory: str, **kwargs):
        kwargs["check_dir"] = False
        kwargs["follow_symlink"] = True
        super().__init__(directory=directory, **kwargs)

    def lookup_path(self, path: str):
        full_path = os.path.abspath(os.path.join(self.directory, path))
        dir_abs = os.path.abspath(self.directory)
        try:
            if os.path.commonpath([full_path, dir_abs]) != dir_abs:
                return "", None
            if os.path.isfile(full_path):
                return full_path, os.stat(full_path)
        except OSError as e:
            if getattr(e, "winerror", None) == 1326:
                connect_smb_share_if_needed()
                try:
                    if os.path.isfile(full_path):
                        return full_path, os.stat(full_path)
                except OSError:
                    pass
        return "", None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def locale_middleware(request: Request, call_next):
    raw = (
        request.query_params.get("lang")
        or request.headers.get("Accept-Language", "en").split(",")[0]
    )
    # Normalize values like "en-US" / "en_US" / "EN"
    locale = (raw or "en").strip().lower().replace("_", "-").split("-")[0]
    if locale not in {"en", "vi", "ko"}:
        locale = "en"
    request.state.locale = locale
    response = await call_next(request)
    return response


# All in vào UPLOAD_ROOT_DIR (không fallback thư mục dự án)
app.mount("/uploads", SafeStaticFiles(directory=UPLOAD_ROOT_DIR), name="uploads")
app.include_router(api_v1_router, prefix="/api/v1")

# Serve frontend build assets if present
dist_dir = os.path.join(os.path.dirname(__file__), "dist")
assets_dir = os.path.join(dist_dir, "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}")
async def serve_vite_app(request: Request, full_path: str):
    if full_path.startswith("api/") or full_path.startswith("uploads/"):
        return {"detail": _("Not Found", request)}
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": _("index.html not found", request)}


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    connect_smb_share_if_needed()
    ensure_upload_dirs()
    start_auto_set_winner_task()
