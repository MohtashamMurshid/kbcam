import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PlasticButton } from '../components/PlasticButton';
import { formatBytes } from '../lib/base64';
import { saveShotToRoll, shareShot } from '../lib/exportShot';
import { deleteShot } from '../lib/storage';
import { Shot } from '../types';
import { colors, type } from '../theme';

type Props = {
  shot: Shot;
  onBack: () => void;
  onDeleted: () => void;
};

export function ShotScreen({ shot, onBack, onDeleted }: Props) {
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

  function remove() {
    deleteShot(shot.id);
    onDeleted();
  }

  return (
    <View style={styles.body}>
      <View style={styles.top}>
        <Text style={styles.wordmark}>SHOT</Text>
        <PlasticButton label="ROLL" onPress={onBack} />
      </View>

      <Text style={styles.size}>{formatBytes(shot.bytes)}</Text>
      <View style={styles.frame}>
        <Image source={{ uri: shot.uri }} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.stamp}>{shot.dateStamp}</Text>
      <Text style={styles.stamp}>{shot.climateStamp}</Text>
      {message ? <Text style={styles.note}>{message}</Text> : null}

      <View style={styles.row}>
        <PlasticButton label="SHARE" disabled={busy} onPress={() => void share()} />
        <PlasticButton label="SAVE ROLL" disabled={busy} onPress={() => void save()} />
        <PlasticButton label="DELETE" disabled={busy} onPress={remove} />
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
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmark: {
    ...type.mark,
    color: colors.text,
  },
  size: {
    ...type.mark,
    color: colors.lcdAmber,
    marginTop: 16,
    marginBottom: 12,
    fontSize: 20,
  },
  frame: {
    flex: 1,
    backgroundColor: colors.lcdBlack,
    borderWidth: 3,
    borderColor: colors.bezel,
    borderRadius: 4,
    overflow: 'hidden',
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
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});
