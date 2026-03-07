from typing import Literal

from pydantic import BaseModel

RosterSlot = Literal["C", "1B", "2B", "SS", "3B", "OF", "UTIL", "SP", "RP", "BN", "IL"]


class RosterUpdate(BaseModel):
    """Lineup slot assignments: maps slot name → mlb_id (or None to clear)."""
    lineup: dict[str, int | None]
    week_number: int
    season_year: int


class AddDrop(BaseModel):
    add_player_mlb_id: int
    drop_player_mlb_id: int
    league_id: str
