import AsyncStorage from '@react-native-async-storage/async-storage';

const FAMILY_KEY = '@mihrab_family';

export interface FamilyMember {
  id: string;
  name: string;
  role: 'admin' | 'member';
  avatarColor: string;
  prayerLog: Record<string, boolean[]>; // date -> [fajr, dhuhr, asr, maghrib, isha]
  joinedAt: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  members: FamilyMember[];
  createdAt: string;
}

const AVATAR_COLORS = [
  '#1D6555', '#2E7D6E', '#1A4A42', '#3D8B7A',
  '#6B4226', '#8B5E3C', '#4A6741', '#5B4A7E',
];

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export const PRAYER_NAMES = ['İmsak', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];

export async function getFamily(): Promise<FamilyGroup | null> {
  try {
    const raw = await AsyncStorage.getItem(FAMILY_KEY);
    return raw ? (JSON.parse(raw) as FamilyGroup) : null;
  } catch {
    return null;
  }
}

export async function saveFamily(family: FamilyGroup): Promise<void> {
  await AsyncStorage.setItem(FAMILY_KEY, JSON.stringify(family));
}

export async function createFamily(name: string, adminName: string): Promise<FamilyGroup> {
  const family: FamilyGroup = {
    id: generateId(),
    name,
    members: [
      {
        id: generateId(),
        name: adminName,
        role: 'admin',
        avatarColor: AVATAR_COLORS[0],
        prayerLog: {},
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };
  await saveFamily(family);
  return family;
}

export async function addMember(family: FamilyGroup, name: string): Promise<FamilyGroup> {
  const updated: FamilyGroup = {
    ...family,
    members: [
      ...family.members,
      {
        id: generateId(),
        name,
        role: 'member',
        avatarColor: getAvatarColor(family.members.length),
        prayerLog: {},
        joinedAt: new Date().toISOString(),
      },
    ],
  };
  await saveFamily(updated);
  return updated;
}

export async function removeMember(family: FamilyGroup, memberId: string): Promise<FamilyGroup> {
  const updated: FamilyGroup = {
    ...family,
    members: family.members.filter((m) => m.id !== memberId),
  };
  await saveFamily(updated);
  return updated;
}

export async function togglePrayer(
  family: FamilyGroup,
  memberId: string,
  prayerIndex: number,
): Promise<FamilyGroup> {
  const today = getTodayKey();
  const updated: FamilyGroup = {
    ...family,
    members: family.members.map((m) => {
      if (m.id !== memberId) return m;
      const todayLog = m.prayerLog[today] ?? [false, false, false, false, false];
      const newLog = [...todayLog] as boolean[];
      newLog[prayerIndex] = !newLog[prayerIndex];
      return { ...m, prayerLog: { ...m.prayerLog, [today]: newLog } };
    }),
  };
  await saveFamily(updated);
  return updated;
}

export function getTodayCount(member: FamilyMember): number {
  const log = member.prayerLog[getTodayKey()];
  return log ? log.filter(Boolean).length : 0;
}

export function getWeeklyCount(member: FamilyMember): number {
  const now = new Date();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const log = member.prayerLog[key];
    if (log) total += log.filter(Boolean).length;
  }
  return total;
}
