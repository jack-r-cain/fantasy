"""APScheduler job: sync MLB rosters, IL moves, call-ups, and transactions every 6 h."""


async def sync_players() -> None:
    """Fetch active rosters + transactions from MLB API and upsert into the players table."""
    raise NotImplementedError
