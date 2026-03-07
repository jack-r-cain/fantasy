"""APScheduler job: sync MLB schedule every Monday at 6 AM ET."""


async def sync_schedule() -> None:
    """Pull the weekly MLB schedule from MLB Stats API and upsert into mlb_schedule."""
    raise NotImplementedError
