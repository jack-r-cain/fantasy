"""Scoring engine: calculate fantasy points from raw MLB stats."""


def calculate_batting_points(stats: dict, scoring_config: dict) -> float:
    """Convert raw batting stats to fantasy points based on league scoring config."""
    raise NotImplementedError


def calculate_pitching_points(stats: dict, scoring_config: dict) -> float:
    """Convert raw pitching stats to fantasy points based on league scoring config."""
    raise NotImplementedError
