import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DigicamStamp } from '../components/DigicamStamp';
import { PlasticButton } from '../components/PlasticButton';
import { ShutterButton } from '../components/ShutterButton';
import { developCapture, developSample } from '../lib/capture';
import { formatClimateStamp, formatCompactCountdown, formatDateStamp } from '../lib/climateClock';
import { Shot } from '../types';
import { colors, type } from '../theme';

type Props = {
  deadlineMs: number;
  lastShot: Shot | null;
  onShot: (shot: Shot) => void;
  onOpenGallery: () => void;
};

export function CameraScreen({ deadlineMs, lastShot, onShot, onOpenGallery }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const dateStamp = formatDateStamp(nowMs);
  const climateStamp = formatClimateStamp(deadlineMs, nowMs);

  if (!permission) {
    return (
      <View style={styles.body}>
        <Text style={styles.wordmark}>kbcam</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.body}>
        <Text style={styles.wordmark}>kbcam</Text>
        <Text style={styles.copy}>
          The camera takes the picture. Then we shrink it, grain it, and burn in the clock.
        </Text>
        <PlasticButton label="ALLOW CAMERA" onPress={() => void requestPermission()} />
        <View style={styles.sampleGap}>
          <PlasticButton
            label="PROCESS SAMPLE"
            onPress={() => {
              const shot = developSample(Date.now(), deadlineMs);
              onShot(shot);
            }}
          />
        </View>
        {Platform.OS === 'web' ? (
          <Text style={styles.hint}>
            This is a phone app. Open it in Expo Go on Android for the real camera. PROCESS SAMPLE
            runs the same lo-fi pipeline on a generated frame.
          </Text>
        ) : null}
      </View>
    );
  }

  async function snap() {
    if (busy || !cameraRef.current) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        shutterSound: true,
        mirror: facing === 'front',
      });
      if (!photo?.uri) {
        throw new Error('The shutter clicked but no file came back');
      }
      const shot = await developCapture(
        photo.uri,
        photo.width,
        photo.height,
        Date.now(),
        deadlineMs,
      );
      onShot(shot);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Capture failed';
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  function flip() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  }

  return (
    <View style={styles.body}>
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>kbcam</Text>
        <Text style={styles.countdown}>{formatCompactCountdown(deadlineMs, nowMs)}</Text>
      </View>

      <View style={styles.lcdWell}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          mirror={facing === 'front'}
          mode="picture"
          mute
        />
        <DigicamStamp dateStamp={dateStamp} climateStamp={climateStamp} />
        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.lcdAmber} />
            <Text style={styles.busyText}>DEVELOPING</Text>
          </View>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.controls}>
        <PlasticButton
          label={flash === 'on' ? 'FLASH ON' : 'FLASH'}
          active={flash === 'on'}
          disabled={busy}
          onPress={toggleFlash}
        />
        <ShutterButton onPress={() => void snap()} disabled={busy} />
        <PlasticButton label="FLIP" disabled={busy} onPress={flip} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open gallery"
        onPress={onOpenGallery}
        style={styles.galleryHit}
      >
        {lastShot ? (
          <View style={styles.thumbWrap}>
            <Image source={{ uri: lastShot.uri }} style={styles.thumb} />
            <Text style={styles.galleryLabel}>ROLL</Text>
          </View>
        ) : (
          <Text style={styles.galleryLabel}>ROLL</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.body,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  wordmark: {
    ...type.mark,
    color: colors.text,
  },
  countdown: {
    ...type.lcd,
    color: colors.lcdAmber,
  },
  copy: {
    ...type.body,
    color: colors.textDim,
    marginVertical: 20,
    lineHeight: 20,
  },
  hint: {
    ...type.body,
    color: colors.plasticDim,
    marginTop: 18,
  },
  sampleGap: {
    marginTop: 12,
  },
  lcdWell: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.lcdBlack,
    borderWidth: 3,
    borderColor: colors.bezel,
    maxHeight: 520,
  },
  camera: {
    flex: 1,
  },
  busy: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000cc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  busyText: {
    ...type.label,
    color: colors.lcdAmber,
  },
  error: {
    ...type.body,
    color: colors.danger,
    marginTop: 10,
  },
  controls: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryHit: {
    marginTop: 18,
    alignSelf: 'center',
    alignItems: 'center',
  },
  thumbWrap: {
    alignItems: 'center',
    gap: 6,
  },
  thumb: {
    width: 36,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.bezel,
    borderWidth: 1,
    borderColor: colors.plasticDim,
  },
  galleryLabel: {
    ...type.label,
    color: colors.plastic,
  },
});
