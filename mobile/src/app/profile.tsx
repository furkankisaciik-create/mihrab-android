import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import {
  AVATAR_COLORS,
  getInitials,
  loadUserProfile,
  saveUserProfile,
  type UserProfile,
} from '@/services/user-profile';
import { loadPrayerTrackerState } from '@/services/prayer-tracker';

// ─── Stats helpers ────────────────────────────────────────────────────────────

function computeQuickStats(state: Awaited<ReturnType<typeof loadPrayerTrackerState>>) {
  if (!state?.days) return { streak: 0, total: 0, monthPct: 0 };

  const keys = Object.keys(state.days).sort();
  let streak = 0;
  let total = 0;

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // streak
  let cursor = todayKey;
  for (let i = 0; i < 365; i++) {
    const d = state.days[cursor];
    const count = d ? Object.keys(d.prayers ?? {}).length : 0;
    if (count < 5) break;
    streak++;
    const date = new Date(cursor);
    date.setDate(date.getDate() - 1);
    cursor = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // total
  for (const key of keys) {
    total += Object.keys(state.days[key].prayers ?? {}).length;
  }

  // this month
  const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const passedDays = today.getDate();
  let monthPrayers = 0;
  for (const key of keys) {
    if (key.startsWith(monthPrefix)) {
      monthPrayers += Object.keys(state.days[key].prayers ?? {}).length;
    }
  }
  const monthPct = passedDays > 0 ? Math.round((monthPrayers / (passedDays * 5)) * 100) : 0;

  return { streak, total, monthPct };
}

// ─── Avatar component ─────────────────────────────────────────────────────────

function Avatar({ name, color, size = 72 }: { name: string; color: string; size?: number }) {
  return (
    <View style={[avatarStyles.circle, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[avatarStyles.initials, { fontSize: size * 0.35 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '900' },
});

// ─── Settings row ─────────────────────────────────────────────────────────────

function SettingsRow({ icon, title, subtitle, onPress, last = false }: {
  icon: string; title: string; subtitle: string; onPress: () => void; last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [rowStyles.row, !last && rowStyles.rowBorder, pressed && rowStyles.pressed]}>
      <View style={rowStyles.icon}>
        <Text style={rowStyles.iconText}>{icon}</Text>
      </View>
      <View style={rowStyles.copy}>
        <Text style={rowStyles.title}>{title}</Text>
        <Text style={rowStyles.sub}>{subtitle}</Text>
      </View>
      <Text style={rowStyles.chevron}>›</Text>
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowBorder: { borderBottomColor: '#E8EEE9', borderBottomWidth: StyleSheet.hairlineWidth },
  pressed: { opacity: 0.75 },
  icon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#E8F1EC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconText: { fontSize: 16 },
  copy: { flex: 1 },
  title: { color: '#20312B', fontSize: 13, fontWeight: '800' },
  sub: { color: '#71807A', fontSize: 10, marginTop: 2 },
  chevron: { color: '#B0BDB8', fontSize: 22 },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({ name: '', avatarColor: AVATAR_COLORS[0], joinedAt: new Date().toISOString() });
  const [stats, setStats] = useState({ streak: 0, total: 0, monthPct: 0 });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadUserProfile().then((p) => {
      setProfile(p);
      setNameInput(p.name);
    });
    loadPrayerTrackerState().then((s) => {
      setStats(computeQuickStats(s));
    });
  }, []);

  const handleSaveName = useCallback(() => {
    const trimmed = nameInput.trim();
    const next = { ...profile, name: trimmed };
    setProfile(next);
    setEditingName(false);
    void saveUserProfile(next);
  }, [profile, nameInput]);

  const handleColorChange = useCallback((color: string) => {
    const next = { ...profile, avatarColor: color };
    setProfile(next);
    void saveUserProfile(next);
  }, [profile]);

  const joinedYear = new Date(profile.joinedAt).getFullYear();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>‹ Geri</Text>
              </Pressable>
            </View>

            {/* Avatar + name */}
            <View style={styles.avatarSection}>
              <Avatar name={profile.name || '?'} color={profile.avatarColor} size={80} />
              {editingName ? (
                <View style={styles.nameInputRow}>
                  <TextInput
                    ref={inputRef}
                    autoFocus
                    value={nameInput}
                    onChangeText={setNameInput}
                    onSubmitEditing={handleSaveName}
                    placeholder="İsminizi girin"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.nameInput}
                    returnKeyType="done"
                    maxLength={40}
                  />
                  <Pressable onPress={handleSaveName} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Kaydet</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => { setEditingName(true); setTimeout(() => inputRef.current?.focus(), 100); }} style={styles.nameRow}>
                  <Text style={styles.heroName}>{profile.name || 'İsim ekle'}</Text>
                  <Text style={styles.editIcon}>✎</Text>
                </Pressable>
              )}
              <Text style={styles.heroSince}>{joinedYear > 2020 ? `MIHRAB · ${joinedYear}'den beri` : 'MIHRAB kullanıcısı'}</Text>
            </View>

            {/* Color picker */}
            <View style={styles.colorRow}>
              {AVATAR_COLORS.map((color) => (
                <Pressable key={color} onPress={() => handleColorChange(color)} style={[styles.colorDot, { backgroundColor: color }, profile.avatarColor === color && styles.colorDotActive]} />
              ))}
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>

          {/* ── Stats card ── */}
          <Text style={styles.sectionLabel}>İSTATİSTİKLER</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.streak}</Text>
                <Text style={styles.statLabel}>gün seri</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>toplam namaz</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <Text style={styles.statValue}>%{stats.monthPct}</Text>
                <Text style={styles.statLabel}>bu ay</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push('/stats' as Href)} style={styles.statsDetailBtn}>
              <Text style={styles.statsDetailText}>Detaylı istatistikler →</Text>
            </Pressable>
          </View>

          {/* ── Settings rows ── */}
          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>AYARLAR</Text>
          <View style={styles.settingsCard}>
            <SettingsRow icon="🔔" title="Bildirimler" subtitle="Namaz vakti bildirimleri" onPress={() => router.push('/notifications' as Href)} />
            <SettingsRow icon="🌐" title="Uygulama dili" subtitle="Türkçe, İngilizce, Arapça" onPress={() => router.push('/language' as Href)} />
            <SettingsRow icon="W" title="Widget" subtitle="Boyut, tema ve içerik özelleştirme" onPress={() => router.push('/home-widget' as Href)} />
            <SettingsRow icon="⌂" title="Aile grubu" subtitle="Aile üyelerinin namaz takibi" onPress={() => router.push('/family' as Href)} />
            <SettingsRow icon="★" title="MIHRAB Premium" subtitle="Tüm gelişmiş özelliklere erişim" onPress={() => router.push('/premium' as Href)} last />
          </View>

          {/* ── App info ── */}
          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>UYGULAMA</Text>
          <View style={styles.settingsCard}>
            <SettingsRow icon="↑" title="Veri yedekleme" subtitle="Namaz verileri ve ayarları JSON olarak dışa aktar" onPress={() => router.push('/backup' as Href)} />
            <SettingsRow icon="P" title="Yol haritası" subtitle="Geliştirme durumu ve planlananlar" onPress={() => router.push('/explore' as Href)} />
            <SettingsRow icon="✦" title="MIHRAB AI" subtitle="İslami sorularınızı yapay zekaya sorun" onPress={() => router.push('/ai' as Href)} />
            <SettingsRow icon="🔒" title="Gizlilik politikası" subtitle="KVKK ve veri kullanımı" onPress={() => router.push('/privacy' as Href)} />
            <SettingsRow icon="🚀" title="Google Play hazırlığı" subtitle="Yayın kontrol listesi" onPress={() => router.push('/release' as Href)} />
            <SettingsRow icon="⚡" title="Performans ve testler" subtitle="Pil, bildirim ve konum doğruluk kontrolleri" onPress={() => router.push('/quality' as Href)} last />
          </View>

          <View style={styles.versionCard}>
            <Text style={styles.versionText}>MIHRAB · Sürüm 1.0.0</Text>
            <Text style={styles.versionSub}>Diyanet vakitleri · Yerel depolama</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6F2' },
  scroll: { paddingBottom: 125 },
  hero: { backgroundColor: '#123E36', borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' },
  heroSafe: { paddingBottom: 28, paddingHorizontal: 20 },
  topBar: { paddingTop: 8 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10, alignSelf: 'flex-start' },
  backText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  avatarSection: { alignItems: 'center', marginTop: 20, gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroName: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  editIcon: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  nameInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', borderBottomWidth: 1.5, borderBottomColor: '#F1CF82', paddingBottom: 4, minWidth: 160, textAlign: 'center' },
  saveBtn: { backgroundColor: '#F1CF82', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  saveBtnText: { color: '#6E5423', fontSize: 11, fontWeight: '900' },
  heroSince: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700' },
  colorRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 14 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#FFFFFF' },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: { color: '#1D6555', fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginBottom: 10 },
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden' },
  statsRow: { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 8 },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: '#E0E9E4', marginVertical: 6 },
  statValue: { color: '#1A594B', fontSize: 26, fontWeight: '900' },
  statLabel: { color: '#71807A', fontSize: 9, fontWeight: '700' },
  statsDetailBtn: { borderTopColor: '#E8EEE9', borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 13, alignItems: 'center' },
  statsDetailText: { color: '#1A594B', fontSize: 12, fontWeight: '800' },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden' },
  versionCard: { alignItems: 'center', marginTop: 24, gap: 4, paddingBottom: 10 },
  versionText: { color: '#95A39D', fontSize: 10, fontWeight: '800' },
  versionSub: { color: '#B3BDB9', fontSize: 9 },
});
