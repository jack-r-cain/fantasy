from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/waivers", tags=["waivers"])


@router.post("/claim")
async def submit_waiver_claim(user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.get("/results")
async def get_waiver_results(user_id: str = Depends(get_current_user)):
    raise NotImplementedError
