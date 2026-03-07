"""Weekly lineup lock logic."""


async def get_lock_time(league_id: str, week_number: int, season_year: int) -> str:
    """Return the ISO timestamp of the first pitch for the given league/week.

    Queries mlb_schedule for the earliest game_time where a rostered player's
    team is playing.
    """
    raise NotImplementedError


async def lock_week(league_id: str, week_number: int, season_year: int) -> None:
    """Set is_locked=True on all weekly_lineups; auto-fill missing submissions."""
    raise NotImplementedError
