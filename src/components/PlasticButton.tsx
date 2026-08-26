import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, type } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  style?: ViewStyle;
};

export function PlasticButton({ label, onPress, disabled, active, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        active ? styles.active : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 3,
    backgroundColor: colors.bodyRaised,
    borderWidth: 1,
    borderColor: colors.bezelHi,
    alignItems: 'center',
  },
  active: {
    borderColor: colors.lcdAmberDim,
  },
  pressed: {
    backgroundColor: colors.bezel,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.label,
    color: colors.text,
  },
});
