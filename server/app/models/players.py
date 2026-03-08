"""Pydantic v2 schemas for player-related requests and responses."""

from typing import Literal

from pydantic import BaseModel, Field

PlayerStatus = Literal["active", "10-day-il", "15-day-il", "60-day-il", "minors"]


class PlayerResponse(BaseModel):
    mlb_id: int
    full_name: str
    team: str
    position: str
    eligible_positions: list[str]
    status: PlayerStatus
    headshot_url: str | None = None
    bats: str | None = None
    throws: str | None = None


class PlayerStatsResponse(BaseModel):
    mlb_id: int
    season: int
    group: Literal["hitting", "pitching"]
    stats: dict


class PlayerSearchResponse(BaseModel):
    players: list[PlayerResponse]
    total: int
    query: str = Field(description="The search query that was executed")
