"""MLB week boundary helpers (Monday–Sunday)."""

from datetime import date, timedelta


def get_week_number(d: date) -> int:
    """Return the MLB fantasy week number for a given date (ISO week number)."""
    return d.isocalendar().week


def get_week_bounds(week_number: int, season_year: int) -> tuple[date, date]:
    """Return (monday, sunday) for the given week number and year."""
    # Find the first Monday of the year, then advance by week offset
    jan4 = date(season_year, 1, 4)  # Jan 4 is always in week 1
    week1_monday = jan4 - timedelta(days=jan4.weekday())
    monday = week1_monday + timedelta(weeks=week_number - 1)
    sunday = monday + timedelta(days=6)
    return monday, sunday


def current_week(today: date | None = None) -> int:
    d = today or date.today()
    return get_week_number(d)
