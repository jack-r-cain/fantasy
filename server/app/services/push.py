"""Expo Push Notification sender."""

import httpx

from app.config import settings


async def send_push(
    push_tokens: list[str],
    title: str,
    body: str,
    data: dict | None = None,
) -> None:
    """POST notification payloads to the Expo push endpoint."""
    messages = [
        {"to": token, "title": title, "body": body, **({"data": data} if data else {})}
        for token in push_tokens
    ]
    async with httpx.AsyncClient() as client:
        resp = await client.post(settings.expo_push_url, json={"messages": messages})
        resp.raise_for_status()
