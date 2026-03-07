"""Diamond Fantasy Baseball — FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    drafts,
    leagues,
    matchups,
    notifications,
    players,
    rosters,
    trades,
    waivers,
)
from app.services.mlb_stats import close_client
from app.tasks.news_fetcher import fetch_news
from app.tasks.player_sync import sync_players
from app.tasks.schedule_sync import sync_schedule
from app.tasks.score_updater import update_scores
from app.tasks.waiver_runner import run_waivers

_scheduler = AsyncIOScheduler()


def _register_jobs() -> None:
    # Live score polling — every 60 s
    _scheduler.add_job(
        update_scores,
        trigger=IntervalTrigger(seconds=60),
        id="score_updater",
        replace_existing=True,
    )
    # Player roster sync — every 6 hours
    _scheduler.add_job(
        sync_players,
        trigger=IntervalTrigger(hours=6),
        id="player_sync",
        replace_existing=True,
    )
    # Schedule sync — every Monday at 06:00 ET
    _scheduler.add_job(
        sync_schedule,
        trigger=CronTrigger(day_of_week="mon", hour=6, minute=0, timezone="America/New_York"),
        id="schedule_sync",
        replace_existing=True,
    )
    # Waiver processing — daily at 03:00 ET (per-league config handled inside the job)
    _scheduler.add_job(
        run_waivers,
        trigger=CronTrigger(hour=3, minute=0, timezone="America/New_York"),
        id="waiver_runner",
        replace_existing=True,
    )
    # Player news — every 30 minutes
    _scheduler.add_job(
        fetch_news,
        trigger=IntervalTrigger(minutes=30),
        id="news_fetcher",
        replace_existing=True,
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    _register_jobs()
    _scheduler.start()
    yield
    _scheduler.shutdown(wait=False)
    await close_client()


app = FastAPI(
    title="Diamond Fantasy Baseball API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(leagues.router)
app.include_router(drafts.router)
app.include_router(rosters.router)
app.include_router(matchups.router)
app.include_router(trades.router)
app.include_router(waivers.router)
app.include_router(players.router)
app.include_router(notifications.router)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
