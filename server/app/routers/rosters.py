from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/rosters", tags=["rosters"])


@router.get("/me")
async def get_my_roster(user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.put("/lineup")
async def update_lineup(user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/add-drop")
async def add_drop(user_id: str = Depends(get_current_user)):
    raise NotImplementedError
