"""Async HTTP client for the MLB Stats API."""

import httpx

from app.config import settings

_limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            base_url=settings.mlb_api_base,
            limits=_limits,
            timeout=10.0,
        )
    return _client


async def close_client() -> None:
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()


async def get_schedule(date: str) -> dict:
    """GET /schedule?date=YYYY-MM-DD&sportId=1"""
    resp = await get_client().get("/schedule", params={"date": date, "sportId": 1})
    resp.raise_for_status()
    return resp.json()


async def get_boxscore(game_pk: int) -> dict:
    """GET /game/{gamePk}/boxscore"""
    resp = await get_client().get(f"/game/{game_pk}/boxscore")
    resp.raise_for_status()
    return resp.json()


async def get_linescore(game_pk: int) -> dict:
    """GET /game/{gamePk}/linescore"""
    resp = await get_client().get(f"/game/{game_pk}/linescore")
    resp.raise_for_status()
    return resp.json()


async def get_team_roster(team_id: int) -> dict:
    """GET /teams/{teamId}/roster?rosterType=active"""
    resp = await get_client().get(f"/teams/{team_id}/roster", params={"rosterType": "active"})
    resp.raise_for_status()
    return resp.json()


async def get_player(person_id: int) -> dict:
    """GET /people/{personId}"""
    resp = await get_client().get(f"/people/{person_id}")
    resp.raise_for_status()
    return resp.json()


async def get_transactions(start_date: str, end_date: str) -> dict:
    """GET /transactions?startDate=...&endDate=..."""
    resp = await get_client().get(
        "/transactions",
        params={"startDate": start_date, "endDate": end_date},
    )
    resp.raise_for_status()
    return resp.json()


async def get_all_teams() -> dict:
    """GET /teams?sportId=1 — all MLB teams for the current season."""
    resp = await get_client().get("/teams", params={"sportId": 1})
    resp.raise_for_status()
    return resp.json()


async def get_player_stats_season(person_id: int, season: int, group: str = "hitting") -> dict:
    """GET /people/{personId}/stats?stats=season&season=YYYY&group=hitting|pitching"""
    resp = await get_client().get(
        f"/people/{person_id}/stats",
        params={"stats": "season", "season": season, "group": group},
    )
    resp.raise_for_status()
    return resp.json()
