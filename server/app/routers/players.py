"""Players router — search players, get player detail, get season stats."""

from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_current_user
from app.models.players import PlayerResponse, PlayerSearchResponse, PlayerStatsResponse
from app.services import mlb_stats
from app.utils.supabase_client import supabase

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/search", response_model=PlayerSearchResponse)
async def search_players(
    q: str = Query(min_length=1, description="Player name search query"),
    status: str | None = Query(default=None, description="Filter by status (active, 10-day-il, etc.)"),  # noqa: E501
    position: str | None = Query(default=None, description="Filter by position (C, 1B, OF, SP, RP, etc.)"),  # noqa: E501
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: str = Depends(get_current_user),
) -> PlayerSearchResponse:
    """Search players by name with optional filters. Results drawn from the local players table."""
    query = (
        supabase.table("players")
        .select("*", count="exact")
        .ilike("full_name", f"%{q}%")
    )

    if status:
        query = query.eq("status", status)
    if position:
        query = query.contains("eligible_positions", [position])

    result = query.range(offset, offset + limit - 1).order("full_name").execute()

    players = [PlayerResponse(**row) for row in (result.data or [])]
    total = result.count or 0

    return PlayerSearchResponse(players=players, total=total, query=q)


@router.get("/{mlb_id}/stats", response_model=PlayerStatsResponse)
async def get_player_stats(
    mlb_id: int,
    season: int | None = Query(default=None, description="Season year (defaults to current year)"),
    group: Literal["hitting", "pitching"] = Query(default="hitting"),
    user_id: str = Depends(get_current_user),
) -> PlayerStatsResponse:
    """Fetch season stats for a player directly from the MLB Stats API."""
    if season is None:
        season = date.today().year

    try:
        data = await mlb_stats.get_player_stats_season(mlb_id, season, group)
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to fetch stats from MLB API")

    stats_list = data.get("stats", [])
    splits = stats_list[0].get("splits", []) if stats_list else []
    aggregated: dict = splits[0].get("stat", {}) if splits else {}

    return PlayerStatsResponse(mlb_id=mlb_id, season=season, group=group, stats=aggregated)


@router.get("/{mlb_id}", response_model=PlayerResponse)
async def get_player(
    mlb_id: int,
    user_id: str = Depends(get_current_user),
) -> PlayerResponse:
    """Get a player from the local database. Falls back to MLB API if not found."""
    result = supabase.table("players").select("*").eq("mlb_id", mlb_id).maybe_single().execute()

    if result.data:
        return PlayerResponse(**result.data)

    # Not cached yet — fetch from MLB API (player_sync will persist it on next run)
    try:
        data = await mlb_stats.get_player(mlb_id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Player {mlb_id} not found")

    people = data.get("people", [])
    if not people:
        raise HTTPException(status_code=404, detail=f"Player {mlb_id} not found")

    p = people[0]
    pos_code = p.get("primaryPosition", {}).get("abbreviation", "")
    status_str = p.get("status", {}).get("description", "Active")

    from app.tasks.player_sync import (  # noqa: PLC0415
        _eligible_positions,
        _headshot_url,
        _map_status,
    )

    return PlayerResponse(
        mlb_id=mlb_id,
        full_name=p.get("fullName", ""),
        team=p.get("currentTeam", {}).get("abbreviation", ""),
        position=pos_code,
        eligible_positions=_eligible_positions(pos_code),
        status=_map_status(status_str),  # type: ignore[arg-type]
        headshot_url=_headshot_url(mlb_id),
        bats=p.get("batSide", {}).get("code"),
        throws=p.get("pitchHand", {}).get("code"),
    )
