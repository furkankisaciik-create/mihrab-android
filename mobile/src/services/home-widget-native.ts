import { Platform } from 'react-native';

import * as MihrabWidget from '../../modules/mihrab-widget/src';
import type { HomeWidgetSnapshot } from '@/types/home-widget';

export async function setNativeHomeWidgetSnapshot(
  snapshot: HomeWidgetSnapshot,
) {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    return MihrabWidget.setSnapshot(JSON.stringify(snapshot));
  } catch {
    return false;
  }
}

export async function refreshNativeHomeWidget() {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    return MihrabWidget.refresh();
  } catch {
    return false;
  }
}
