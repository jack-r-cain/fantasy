from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.post("/{draft_id}/start")
async def start_draft(draft_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/{draft_id}/pick")
async def make_pick(draft_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.get("/{draft_id}/board")
async def get_draft_board(draft_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError
