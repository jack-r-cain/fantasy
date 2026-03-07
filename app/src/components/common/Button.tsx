import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', isLoading, disabled, style }: ButtonProps) {
  const bg = variant === 'primary' ? '#3b82f6' : variant === 'secondary' ? '#1e293b' : variant === 'danger' ? '#ef4444' : 'transparent';
  const pad = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  return (
    <TouchableOpacity
      style={[styles.base, { backgroundColor: bg, paddingVertical: pad }, style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[styles.label, { fontSize }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  label: { color: '#f8fafc', fontWeight: '600' },
});
