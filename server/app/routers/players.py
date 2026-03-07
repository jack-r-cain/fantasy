from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/search")
async def search_players(q: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.get("/{mlb_id}")
async def get_player(mlb_id: int, user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.get("/{mlb_id}/stats")
async def get_player_stats(mlb_id: int, user_id: str = Depends(get_current_user)):
    raise NotImplementedError
