"""Draft state machine: snake order, pick validation, auto-draft, auction."""


def generate_snake_order(team_ids: list[str], rounds: int) -> list[str]:
    """Return the full draft order as a flat list of team_ids for a snake draft."""
    order: list[str] = []
    for round_num in range(rounds):
        if round_num % 2 == 0:
            order.extend(team_ids)
        else:
            order.extend(reversed(team_ids))
    return order


async def process_pick(draft_id: str, member_id: str, player_mlb_id: int) -> None:
    """Validate and record a draft pick; advance draft state."""
    raise NotImplementedError


async def auto_draft_pick(draft_id: str, member_id: str) -> None:
    """Select the highest-ranked available player for a manager who timed out."""
    raise NotImplementedError
