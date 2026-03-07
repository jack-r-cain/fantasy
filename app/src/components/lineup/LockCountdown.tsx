import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLockCountdown, isLockCountdownActive } from '../../utils/dates';

interface LockCountdownProps {
  lockTime: string | null;
}

export function LockCountdown({ lockTime }: LockCountdownProps) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!lockTime) return;
    const tick = () => setCountdown(getLockCountdown(lockTime));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockTime]);

  if (!lockTime) return null;

  const isActive = isLockCountdownActive(lockTime);

  return (
    <View style={[styles.container, !isActive && styles.locked]}>
      <Text style={styles.label}>{isActive ? 'Locks in' : 'Locked'}</Text>
      {isActive && <Text style={styles.countdown}>{countdown}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  locked: { backgroundColor: '#450a0a' },
  label: { color: '#94a3b8', fontSize: 12 },
  countdown: { color: '#f59e0b', fontWeight: '700', fontSize: 14 },
});
