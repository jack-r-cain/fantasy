"""APScheduler job: process pending waiver claims (FAAB or priority)."""


async def run_waivers() -> None:
    """Resolve waiver claims: highest FAAB bid wins, tiebreak by priority."""
    raise NotImplementedError
