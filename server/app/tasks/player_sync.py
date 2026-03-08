"""APScheduler job: sync MLB rosters, IL moves, call-ups, and transactions every 6 h."""

import asyncio
import logging
from datetime import date, timedelta

from app.services import mlb_stats
from app.utils.supabase_client import supabase

logger = logging.getLogger(__name__)

# MLB position code → fantasy eligible positions map
_POSITION_ELIGIBILITY: dict[str, list[str]] = {
    "C": ["C", "UTIL"],
    "1B": ["1B", "UTIL"],
    "2B": ["2B", "UTIL"],
    "3B": ["3B", "UTIL"],
    "SS": ["SS", "UTIL"],
    "LF": ["OF", "UTIL"],
    "CF": ["OF", "UTIL"],
    "RF": ["OF", "UTIL"],
    "OF": ["OF", "UTIL"],
    "DH": ["UTIL"],
    "SP": ["SP"],
    "RP": ["RP"],
    "P": ["SP", "RP"],
}

# MLB transaction type strings that indicate IL placement
_IL_TYPES = {
    "10-Day Injured List",
    "15-Day Injured List",
    "60-Day Injured List",
}
_IL_STATUS_MAP = {
    "10-Day Injured List": "10-day-il",
    "15-Day Injured List": "15-day-il",
    "60-Day Injured List": "60-day-il",
}


def _map_status(mlb_status: str) -> str:
    """Convert MLB API status string to our internal status enum."""
    status_lower = mlb_status.lower()
    if "10-day" in status_lower:
        return "10-day-il"
    if "15-day" in status_lower:
        return "15-day-il"
    if "60-day" in status_lower:
        return "60-day-il"
    if "minor" in status_lower or "optioned" in status_lower:
        return "minors"
    return "active"


def _eligible_positions(primary_pos: str) -> list[str]:
    return _POSITION_ELIGIBILITY.get(primary_pos, ["UTIL"])


def _headshot_url(mlb_id: int) -> str:
    return (
        "https://img.mlbstatic.com/mlb-photos/image/upload/"
        "d_people:generic:headshot:67:current.png/w_213,q_auto:best/"
        f"v1/people/{mlb_id}/headshot/67/current"
    )


async def _fetch_roster_players(team_id: int, team_abbrev: str) -> list[dict]:
    """Return a list of player upsert dicts for one team's active roster."""
    try:
        data = await mlb_stats.get_team_roster(team_id)
    except Exception as exc:
        logger.warning("Failed to fetch roster for team %s: %s", team_id, exc)
        return []

    players: list[dict] = []
    for entry in data.get("roster", []):
        person = entry.get("person", {})
        mlb_id = person.get("id")
        if not mlb_id:
            continue

        pos_code = entry.get("position", {}).get("abbreviation", "")
        status_str = entry.get("status", {}).get("description", "Active")

        players.append(
            {
                "mlb_id": mlb_id,
                "full_name": person.get("fullName", ""),
                "team": team_abbrev,
                "position": pos_code,
                "eligible_positions": _eligible_positions(pos_code),
                "status": _map_status(status_str),
                "headshot_url": _headshot_url(mlb_id),
            }
        )
    return players


async def _upsert_players(players: list[dict]) -> None:
    if not players:
        return
    supabase.table("players").upsert(players, on_conflict="mlb_id").execute()


async def _apply_transactions(il_status_updates: dict[int, str]) -> None:
    """Bulk-update player status for IL/activation transactions."""
    for mlb_id, new_status in il_status_updates.items():
        supabase.table("players").update({"status": new_status}).eq("mlb_id", mlb_id).execute()


async def sync_players() -> None:
    """Fetch active rosters + transactions from MLB API and upsert into the players table."""
    logger.info("player_sync: starting")

    # 1. Get all MLB teams
    try:
        teams_data = await mlb_stats.get_all_teams()
    except Exception as exc:
        logger.error("player_sync: failed to fetch teams: %s", exc)
        return

    teams_map: dict[int, str] = {
        t["id"]: t.get("abbreviation", str(t["id"]))
        for t in teams_data.get("teams", [])
    }
    team_ids = list(teams_map.keys())
    logger.info("player_sync: found %d teams", len(team_ids))

    # 2. Fetch rosters concurrently (throttle to 10 req/s via semaphore)
    semaphore = asyncio.Semaphore(10)

    async def fetch_with_sem(tid: int) -> list[dict]:
        async with semaphore:
            return await _fetch_roster_players(tid, teams_map[tid])

    roster_results = await asyncio.gather(*[fetch_with_sem(tid) for tid in team_ids])

    all_players: list[dict] = []
    for players in roster_results:
        all_players.extend(players)

    logger.info("player_sync: fetched %d players from rosters", len(all_players))

    # 3. Upsert in batches of 500
    batch_size = 500
    for i in range(0, len(all_players), batch_size):
        await _upsert_players(all_players[i : i + batch_size])

    # 4. Fetch recent transactions (last 7 days) to capture IL moves / activations
    today = date.today()
    start = (today - timedelta(days=7)).isoformat()
    end = today.isoformat()
    try:
        tx_data = await mlb_stats.get_transactions(start, end)
    except Exception as exc:
        logger.warning("player_sync: failed to fetch transactions: %s", exc)
        tx_data = {}

    il_updates: dict[int, str] = {}
    for tx in tx_data.get("transactions", []):
        tx_type = tx.get("typeDesc", "")
        person = tx.get("person", {})
        mlb_id = person.get("id")
        if not mlb_id:
            continue

        if tx_type in _IL_TYPES:
            il_updates[mlb_id] = _IL_STATUS_MAP[tx_type]
        elif tx_type in ("Reinstated from Injured List", "Activated"):
            # Mark active only if not already overwritten by a later IL entry
            il_updates.setdefault(mlb_id, "active")

    if il_updates:
        logger.info("player_sync: applying %d transaction status updates", len(il_updates))
        await _apply_transactions(il_updates)

    logger.info("player_sync: complete — %d players upserted", len(all_players))
