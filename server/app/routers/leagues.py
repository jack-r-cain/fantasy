from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/leagues", tags=["leagues"])


@router.post("")
async def create_league(user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.get("/{league_id}")
async def get_league(league_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.put("/{league_id}/settings")
async def update_league_settings(league_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/{league_id}/join")
async def join_league(league_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError
