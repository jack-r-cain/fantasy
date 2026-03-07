"""APScheduler job: poll MLB API every 60 s during game hours and upsert player_game_stats."""


async def update_scores() -> None:
    """Fetch live box scores and broadcast updated fantasy points via Supabase Realtime."""
    raise NotImplementedError
