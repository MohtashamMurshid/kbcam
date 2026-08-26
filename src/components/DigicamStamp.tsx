import { StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../theme';

type Props = {
  dateStamp: string;
  climateStamp: string;
};

export function DigicamStamp({ dateStamp, climateStamp }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.line}>{dateStamp}</Text>
      <Text style={styles.line}>{climateStamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 10,
    bottom: 8,
  },
  line: {
    ...type.lcd,
    color: colors.lcdAmber,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
