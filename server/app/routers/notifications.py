from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def get_notifications(user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.put("/preferences")
async def update_preferences(user_id: str = Depends(get_current_user)):
    raise NotImplementedError
