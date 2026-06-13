import { requireNativeModule } from 'expo';

type MihrabWidgetModule = {
  setSnapshot(payload: string): boolean;
  getSnapshot(): string | null;
  refresh(): boolean;
};

let nativeModule: MihrabWidgetModule | null | undefined;

function getNativeModule() {
  if (nativeModule !== undefined) {
    return nativeModule;
  }

  try {
    nativeModule = requireNativeModule<MihrabWidgetModule>('MihrabWidget');
  } catch {
    nativeModule = null;
  }

  return nativeModule;
}

export function setSnapshot(payload: string) {
  return getNativeModule()?.setSnapshot(payload) ?? false;
}

export function getSnapshot() {
  return getNativeModule()?.getSnapshot() ?? null;
}

export function refresh() {
  return getNativeModule()?.refresh() ?? false;
}
