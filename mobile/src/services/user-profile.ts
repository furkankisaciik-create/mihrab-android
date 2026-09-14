import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  name: string;
  avatarColor: string;
  joinedAt: string;
};

const STORAGE_KEY = '@mihrab_user_profile';

export const AVATAR_COLORS = [
  '#1A594B', '#2E6B8A', '#7B4E9E', '#B85C38',
  '#2D7D5A', '#8B6914', '#4A5568', '#C0392B',
];

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  avatarColor: AVATAR_COLORS[0],
  joinedAt: new Date().toISOString(),
};

export async function loadUserProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<UserProfile>) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
