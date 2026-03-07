from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/matchups", tags=["matchups"])


@router.get("/current")
async def get_current_matchup(user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.get("/{matchup_id}/scores")
async def get_matchup_scores(matchup_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError
