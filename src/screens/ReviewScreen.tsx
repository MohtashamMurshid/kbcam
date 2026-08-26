import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PlasticButton } from '../components/PlasticButton';
import { formatBytes } from '../lib/base64';
import { saveShotToRoll, shareShot } from '../lib/exportShot';
import { Shot } from '../types';
import { colors, type } from '../theme';

type Props = {
  shot: Shot;
  onDone: () => void;
  onOpenGallery: () => void;
};

export function ReviewScreen({ shot, onDone, onOpenGallery }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    setMessage(null);
    try {
      await shareShot(shot);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Share failed');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      await saveShotToRoll(shot);
      setMessage('Saved to camera roll');
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.body}>
      <Text style={styles.wordmark}>kbcam</Text>
      <Text style={styles.size}>{formatBytes(shot.bytes)}</Text>
      <Text style={styles.meta}>
        {shot.width}×{shot.height}  ·  JPEG
      </Text>

      <View style={styles.frame}>
        <Image source={{ uri: shot.uri }} style={styles.image} resizeMode="contain" />
      </View>

      <Text style={styles.stamp}>{shot.dateStamp}</Text>
      <Text style={styles.stamp}>{shot.climateStamp}</Text>
      {message ? <Text style={styles.note}>{message}</Text> : null}

      <View style={styles.row}>
        <PlasticButton label="SHARE" disabled={busy} onPress={() => void share()} />
        <PlasticButton label="SAVE ROLL" disabled={busy} onPress={() => void save()} />
      </View>
      <View style={styles.row}>
        <PlasticButton label="ROLL" disabled={busy} onPress={onOpenGallery} />
        <PlasticButton label="CAMERA" disabled={busy} onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.body,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  wordmark: {
    ...type.mark,
    color: colors.text,
  },
  size: {
    ...type.mark,
    color: colors.lcdAmber,
    marginTop: 16,
    fontSize: 22,
  },
  meta: {
    ...type.label,
    color: colors.textDim,
    marginTop: 6,
    marginBottom: 14,
  },
  frame: {
    flex: 1,
    backgroundColor: colors.lcdBlack,
    borderWidth: 3,
    borderColor: colors.bezel,
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 220,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  stamp: {
    ...type.lcd,
    color: colors.lcdAmber,
    marginTop: 8,
  },
  note: {
    ...type.body,
    color: colors.text,
    marginTop: 10,
  },
  row: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
