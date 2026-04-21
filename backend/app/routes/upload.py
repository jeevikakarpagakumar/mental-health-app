"""Upload + public download routes for images."""
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile

from app.utils.dependencies import get_current_user
from app.services.storage_service import upload_image, get_object

router = APIRouter()

ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/image")
async def upload_image_endpoint(
    file: UploadFile = File(...),
    firebase_user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds 5 MB limit")

    path = upload_image(data, file.filename or "upload", file.content_type, firebase_user["uid"])
    return {"path": path, "url": f"/api/files/{path}"}


def download_file(path: str):
    """Public download endpoint — used for doctor avatars visible to all patients."""
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(
        content=data,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )
