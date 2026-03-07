from pydantic import BaseModel, Field


class DraftPick(BaseModel):
    player_mlb_id: int
    bid_amount: int | None = Field(default=None, ge=0)  # auction only
