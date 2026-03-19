import asyncio

import cloudinary
import cloudinary.uploader

from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_avatar(file_bytes: bytes, user_id: int) -> str:
    """Upload user avatar to Cloudinary, returns secure URL."""
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: cloudinary.uploader.upload(
            file_bytes,
            public_id=f"user_{user_id}",
            folder="avatars",
            overwrite=True,
            resource_type="image",
            transformation=[
                {"width": 300, "height": 300, "crop": "fill", "gravity": "face"},
                {"quality": "auto"},
                {"fetch_format": "auto"},
            ],
        ),
    )
    return result["secure_url"]


async def delete_avatar(user_id: int) -> None:
    """Delete user avatar from Cloudinary."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: cloudinary.uploader.destroy(f"avatars/user_{user_id}"),
    )