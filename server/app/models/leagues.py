from typing import Any, Literal

from pydantic import BaseModel, Field


class LeagueCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    scoring_type: Literal["h2h_cat", "h2h_points", "roto", "points"] = "h2h_points"
    lineup_mode: Literal["weekly", "daily"] = "weekly"
    max_teams: int = Field(default=10, ge=4, le=20)
    roster_config: dict[str, Any] = Field(default_factory=dict)
    scoring_config: dict[str, Any] = Field(default_factory=dict)
    waiver_type: Literal["faab", "priority", "free"] = "faab"
    faab_budget: int = Field(default=100, ge=0)
    trade_review_period: int = Field(default=2, ge=0, le=7)
    trade_review_type: Literal["commissioner", "league_vote"] = "commissioner"
    playoff_teams: int = Field(default=4, ge=2)
    season_year: int


class LeagueSettingsUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    scoring_type: Literal["h2h_cat", "h2h_points", "roto", "points"] | None = None
    lineup_mode: Literal["weekly", "daily"] | None = None
    trade_review_period: int | None = Field(default=None, ge=0, le=7)
    trade_review_type: Literal["commissioner", "league_vote"] | None = None
    playoff_teams: int | None = Field(default=None, ge=2)
    settings: dict[str, Any] | None = None


class JoinLeague(BaseModel):
    invite_code: str
    team_name: str = Field(min_length=1, max_length=60)
