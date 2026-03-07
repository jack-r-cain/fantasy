from pydantic import BaseModel, Field


class TradeAsset(BaseModel):
    from_member_id: str
    to_member_id: str
    player_mlb_id: int | None = None
    faab_amount: int | None = Field(default=None, ge=0)


class TradeProposal(BaseModel):
    league_id: str
    assets: list[TradeAsset] = Field(min_length=1)
