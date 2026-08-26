import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import { Shot } from '../types';

export async function shareShot(shot: Shot): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(shot.uri, {
    mimeType: 'image/jpeg',
    UTI: 'public.jpeg',
    dialogTitle: 'Share kbcam shot',
  });
}

export async function saveShotToRoll(shot: Shot): Promise<void> {
  const current = await MediaLibrary.getPermissionsAsync();
  const permission = current.granted
    ? current
    : await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Allow photo access to save this shot to the camera roll');
  }
  await MediaLibrary.saveToLibraryAsync(shot.uri);
}
