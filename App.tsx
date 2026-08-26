import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';

import { loadClock } from './src/lib/clockStore';
import { listShots } from './src/lib/storage';
import { CameraScreen } from './src/screens/CameraScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';
import { ShotScreen } from './src/screens/ShotScreen';
import { colors, type } from './src/theme';
import { ClockState, Route, Shot } from './src/types';

export default function App() {
  const [clock, setClock] = useState<ClockState | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [route, setRoute] = useState<Route>({ name: 'camera' });
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setShots(listShots());
    } catch (caught) {
      setBootError(caught instanceof Error ? caught.message : 'Could not read the local roll');
    }
    void loadClock(Date.now())
      .then(setClock)
      .catch((caught: unknown) => {
        setBootError(caught instanceof Error ? caught.message : 'Could not load the climate clock');
      });
  }, []);

  function rememberShot(shot: Shot) {
    setShots((current) => [shot, ...current.filter((item) => item.id !== shot.id)]);
  }

  function forgetShot(id: string) {
    setShots((current) => current.filter((item) => item.id !== id));
  }

  if (bootError) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Text style={styles.wordmark}>kbcam</Text>
        <Text style={styles.error}>{bootError}</Text>
      </View>
    );
  }

  if (!clock) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Text style={styles.wordmark}>kbcam</Text>
        <Text style={styles.dim}>loading clock</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {renderRoute(route, clock.deadlineMs, shots, setRoute, rememberShot, forgetShot)}
    </View>
  );
}

function renderRoute(
  route: Route,
  deadlineMs: number,
  shots: Shot[],
  setRoute: (route: Route) => void,
  rememberShot: (shot: Shot) => void,
  forgetShot: (id: string) => void,
) {
  switch (route.name) {
    case 'camera':
      return (
        <CameraScreen
          deadlineMs={deadlineMs}
          lastShot={shots[0] ?? null}
          onShot={(shot) => {
            rememberShot(shot);
            setRoute({ name: 'review', shot });
          }}
          onOpenGallery={() => setRoute({ name: 'gallery' })}
        />
      );
    case 'review':
      return (
        <ReviewScreen
          shot={route.shot}
          onDone={() => setRoute({ name: 'camera' })}
          onOpenGallery={() => setRoute({ name: 'gallery' })}
        />
      );
    case 'gallery':
      return (
        <GalleryScreen
          shots={shots}
          onBack={() => setRoute({ name: 'camera' })}
          onOpen={(shot) => setRoute({ name: 'shot', shot })}
        />
      );
    case 'shot':
      return (
        <ShotScreen
          shot={route.shot}
          onBack={() => setRoute({ name: 'gallery' })}
          onDeleted={() => {
            forgetShot(route.shot.id);
            setRoute({ name: 'gallery' });
          }}
        />
      );
    default: {
      const _never: never = route;
      return _never;
    }
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.body,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 12) : 44,
  },
  center: {
    flex: 1,
    backgroundColor: colors.body,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  wordmark: {
    ...type.mark,
    color: colors.text,
    marginBottom: 12,
  },
  dim: {
    ...type.body,
    color: colors.textDim,
  },
  error: {
    ...type.body,
    color: colors.danger,
    textAlign: 'center',
  },
});
