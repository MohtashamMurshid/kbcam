import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  onPress: () => void;
  disabled?: boolean;
};

export function ShutterButton({ onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Shutter"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ring,
        pressed ? styles.ringPressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <View style={styles.inner} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.bezel,
    borderWidth: 4,
    borderColor: colors.shutterRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPressed: {
    borderColor: colors.plastic,
  },
  inner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.shutter,
    borderWidth: 1,
    borderColor: '#ffffffaa',
  },
  disabled: {
    opacity: 0.35,
  },
});
