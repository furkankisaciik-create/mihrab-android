import type { HomeWidgetSnapshot } from '@/types/home-widget';

export async function setNativeHomeWidgetSnapshot(
  _snapshot: HomeWidgetSnapshot,
) {
  return false;
}

export async function refreshNativeHomeWidget() {
  return false;
}
