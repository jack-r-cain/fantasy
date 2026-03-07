import type { RosterSlot } from '../types';

export const POSITION_ORDER: RosterSlot[] = [
  'C', '1B', '2B', 'SS', '3B', 'OF', 'UTIL', 'SP', 'RP', 'BN', 'IL',
];

export const BATTING_POSITIONS: RosterSlot[] = ['C', '1B', '2B', 'SS', '3B', 'OF', 'UTIL'];
export const PITCHING_POSITIONS: RosterSlot[] = ['SP', 'RP'];
export const BENCH_POSITIONS: RosterSlot[] = ['BN', 'IL'];

export function canFillSlot(playerPositions: RosterSlot[], slot: RosterSlot): boolean {
  if (slot === 'BN') return true;
  if (slot === 'IL') return false; // only via IL move
  if (slot === 'UTIL') return BATTING_POSITIONS.filter(p => p !== 'UTIL').some(p => playerPositions.includes(p));
  return playerPositions.includes(slot);
}

export function getDisplayPosition(positions: RosterSlot[]): string {
  const primary = POSITION_ORDER.find(p => positions.includes(p) && p !== 'BN' && p !== 'IL' && p !== 'UTIL');
  return primary ?? positions[0] ?? 'UTIL';
}
