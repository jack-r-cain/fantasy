from pydantic import BaseModel, Field


class WaiverClaim(BaseModel):
    league_id: str
    player_mlb_id: int
    drop_player_mlb_id: int | None = None
    bid_amount: int = Field(default=0, ge=0)
