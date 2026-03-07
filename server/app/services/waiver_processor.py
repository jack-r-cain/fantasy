"""FAAB waiver resolution: highest bid wins, tiebreak by priority."""


async def process_waiver_claims(league_id: str) -> None:
    """Sort pending claims by bid (desc) then priority (asc) and execute valid claims."""
    raise NotImplementedError
