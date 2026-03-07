export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export function getMLBWeekBoundaries(date: Date): { start: Date; end: Date } {
  const day = date.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day; // Mon start
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function formatGameTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isLockCountdownActive(lockTime: string | null): boolean {
  if (!lockTime) return false;
  return new Date(lockTime) > new Date();
}

export function getLockCountdown(lockTime: string): string {
  const diff = new Date(lockTime).getTime() - Date.now();
  if (diff <= 0) return 'Locked';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
