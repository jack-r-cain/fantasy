import type { ScoringConfig, PlayerGameStats } from '../types';

export function calculateFantasyPoints(
  stats: Record<string, number>,
  statType: 'batting' | 'pitching',
  config: ScoringConfig
): number {
  let points = 0;

  if (statType === 'batting') {
    points += (stats.H ?? 0) * (config.H ?? 0);
    points += (stats['2B'] ?? 0) * (config['2B'] ?? 0);
    points += (stats['3B'] ?? 0) * (config['3B'] ?? 0);
    points += (stats.HR ?? 0) * (config.HR ?? 0);
    points += (stats.RBI ?? 0) * (config.RBI ?? 0);
    points += (stats.R ?? 0) * (config.R ?? 0);
    points += (stats.SB ?? 0) * (config.SB ?? 0);
    points += (stats.BB ?? 0) * (config.BB ?? 0);
    points += (stats.K ?? 0) * (config.K ?? 0);
  } else {
    points += (stats.W ?? 0) * (config.W ?? 0);
    points += (stats.SV ?? 0) * (config.SV ?? 0);
    points += (stats.HLD ?? 0) * (config.HLD ?? 0);
    points += (stats.K ?? 0) * (config.K9 ?? 0);
    points += (stats.IP ?? 0) * (config.IP ?? 0);
    points += (stats.QS ?? 0) * (config.QS ?? 0);
  }

  return Math.round(points * 100) / 100;
}

export function aggregateWeeklyStats(gameStats: PlayerGameStats[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const game of gameStats) {
    for (const [key, value] of Object.entries(game.stats)) {
      totals[key] = (totals[key] ?? 0) + value;
    }
  }
  return totals;
}
