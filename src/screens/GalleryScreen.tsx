import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PlasticButton } from '../components/PlasticButton';
import { formatBytes } from '../lib/base64';
import { Shot } from '../types';
import { colors, type } from '../theme';

type Props = {
  shots: Shot[];
  onBack: () => void;
  onOpen: (shot: Shot) => void;
};

export function GalleryScreen({ shots, onBack, onOpen }: Props) {
  return (
    <View style={styles.body}>
      <View style={styles.top}>
        <Text style={styles.wordmark}>ROLL</Text>
        <PlasticButton label="CAMERA" onPress={onBack} />
      </View>

      {shots.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No shots yet</Text>
          <Text style={styles.emptyCopy}>
            Take one. It should land around a few dozen KB — a real small JPEG, not a filter on a
            12MP file.
          </Text>
        </View>
      ) : (
        <FlatList
          data={shots}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open shot ${item.dateStamp}`}
              onPress={() => onOpen(item)}
              style={styles.cell}
            >
              <Image source={{ uri: item.uri }} style={styles.thumb} />
              <Text style={styles.kb}>{formatBytes(item.bytes)}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.body,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 18,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wordmark: {
    ...type.mark,
    color: colors.text,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  emptyTitle: {
    ...type.mark,
    color: colors.text,
    marginBottom: 10,
  },
  emptyCopy: {
    ...type.body,
    color: colors.textDim,
    lineHeight: 20,
  },
  grid: {
    paddingBottom: 24,
    gap: 8,
  },
  cell: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 4,
  },
  thumb: {
    flex: 1,
    backgroundColor: colors.lcdBlack,
    borderWidth: 1,
    borderColor: colors.bezel,
  },
  kb: {
    ...type.label,
    color: colors.plastic,
    marginTop: 4,
  },
});
