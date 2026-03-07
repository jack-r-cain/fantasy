import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 40, style }: AvatarProps) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  if (uri) {
    return <Image source={{ uri }} style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
  }

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#f8fafc', fontWeight: '600' },
});
