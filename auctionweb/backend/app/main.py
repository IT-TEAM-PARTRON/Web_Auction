# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import router as api_v1_router
from app.tasks.auto_approve import start_auto_set_winner_task
from fastapi.responses import FileResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def locale_middleware(request: Request, call_next):
    locale = request.query_params.get("lang") or request.headers.get("Accept-Language", "en").split(",")[0]
    request.state.locale = locale
    response = await call_next(request)
    return response

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(api_v1_router, prefix="/api/v1")
app.mount("/assets", StaticFiles(directory="app/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_vite_app(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("uploads/"):
        return {"detail": "Not Found"}
    index_path = os.path.join("app", "dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "index.html not found"}
# async def serve_vite_app(request: Request, full_path: str):
#     if request.url.path.startswith("/api/") or request.url.path.startswith("/uploads/") or request.url.path.startswith("/assets/"):
#         return {"detail": "Not Found"}
#     index_path = os.path.join("app", "dist", "index.html")
#     if os.path.exists(index_path):
#         return FileResponse(index_path)
#     return {"detail": "index.html not found"}

@app.get("/api/v1/health")
def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    start_auto_set_winner_task()