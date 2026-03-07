"""APScheduler job: lock weekly lineups at the dynamic first-pitch time."""


async def lock_lineups() -> None:
    """Set is_locked=True on all weekly_lineups for the current week.

    If a manager has not submitted, auto-generate lineup from their rosters table.
    """
    raise NotImplementedError
