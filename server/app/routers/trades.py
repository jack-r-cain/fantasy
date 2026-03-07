from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter(prefix="/trades", tags=["trades"])


@router.post("")
async def propose_trade(user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.put("/{trade_id}/accept")
async def accept_trade(trade_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError


@router.put("/{trade_id}/reject")
async def reject_trade(trade_id: str, user_id: str = Depends(get_current_user)):
    raise NotImplementedError
