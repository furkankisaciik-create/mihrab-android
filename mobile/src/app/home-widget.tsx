import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useHomeWidget } from '@/hooks/use-home-widget';
import {
  loadWidgetSettings,
  saveWidgetSettings,
  type WidgetSettings,
  type WidgetSize,
  type WidgetTheme,
} from '@/services/widget-settings';
import type { HomeWidgetSnapshot } from '@/types/home-widget';

// ─── Theme palette ────────────────────────────────────────────────────────────

const THEMES = {
  dark: {
    bg: '#0F302A',
    surface: '#1A594B',
    text: '#FFFFFF',
    subtext: '#BBD0C8',
    accent: '#F1CF82',
    border: 'rgba(255,255,255,0.08)',
  },
  light: {
    bg: '#FFFFFF',
    surface: '#E8F1EC',
    text: '#1C2A26',
    subtext: '#64736E',
    accent: '#1A594B',
    border: 'rgba(0,0,0,0.07)',
  },
  minimal: {
    bg: '#111111',
    surface: 'rgba(255,255,255,0.09)',
    text: '#FFFFFF',
    subtext: 'rgba(255,255,255,0.5)',
    accent: '#71C89B',
    border: 'rgba(255,255,255,0.06)',
  },
};

// ─── Widget preview components ────────────────────────────────────────────────

type PreviewProps = {
  snapshot: HomeWidgetSnapshot | null;
  theme: WidgetTheme;
  showHijri: boolean;
  showTracker: boolean;
};

function SmallPreview({ snapshot, theme }: PreviewProps) {
  const t = THEMES[theme];
  return (
    <View style={[previewStyles.small, { backgroundColor: t.bg, borderColor: t.border }]}>
      <View style={previewStyles.smallTop}>
        <Text style={[previewStyles.smallBrand, { color: t.accent }]}>MIHRAB</Text>
        <Text numberOfLines={1} style={[previewStyles.smallLoc, { color: t.subtext }]}>
          {snapshot?.location ?? 'İstanbul'}
        </Text>
      </View>
      <Text style={[previewStyles.smallNext, { color: t.text }]}>
        {snapshot?.nextPrayerName ?? 'Akşam'}
      </Text>
      <View style={previewStyles.smallBottom}>
        <Text style={[previewStyles.smallTime, { color: t.accent }]}>
          {snapshot?.nextPrayerTime ?? '19:45'}
        </Text>
        <Text style={[previewStyles.smallRemain, { color: t.subtext }]}>
          {snapshot?.remainingLabel ?? '12 dk kaldı'}
        </Text>
      </View>
    </View>
  );
}

function MediumPreview({ snapshot, theme, showHijri }: PreviewProps) {
  const t = THEMES[theme];
  const prayers = snapshot?.prayers.slice(0, 4) ?? [];
  return (
    <View style={[previewStyles.medium, { backgroundColor: t.bg, borderColor: t.border }]}>
      <View style={previewStyles.medTop}>
        <Text style={[previewStyles.medBrand, { color: t.accent }]}>MIHRAB</Text>
        {showHijri ? (
          <Text numberOfLines={1} style={[previewStyles.medDate, { color: t.subtext }]}>
            {snapshot?.hijriDate ?? '13 Rebiyülevvel 1447'}
          </Text>
        ) : (
          <Text numberOfLines={1} style={[previewStyles.medDate, { color: t.subtext }]}>
            {snapshot?.location ?? 'İstanbul'}
          </Text>
        )}
      </View>
      <Text style={[previewStyles.medNext, { color: t.text }]}>
        {snapshot?.nextPrayerName ?? 'Akşam'}
      </Text>
      <View style={previewStyles.medHeroRow}>
        <Text style={[previewStyles.medTime, { color: t.accent }]}>
          {snapshot?.nextPrayerTime ?? '19:45'}
        </Text>
        <Text style={[previewStyles.medRemain, { color: t.subtext }]}>
          {snapshot?.remainingLabel ?? '12 dk'}
        </Text>
      </View>
      <View style={[previewStyles.medDivider, { backgroundColor: t.border }]} />
      <View style={previewStyles.medRows}>
        {prayers.length ? prayers.map((p) => (
          <View key={p.key + p.dateTime} style={[previewStyles.medRow, { backgroundColor: t.surface }]}>
            <Text style={[previewStyles.medRowName, { color: t.text }]}>{p.name}</Text>
            <Text style={[previewStyles.medRowTime, { color: t.accent }]}>{p.time}</Text>
          </View>
        )) : [0, 1, 2, 3].map((i) => (
          <View key={i} style={[previewStyles.medRow, { backgroundColor: t.surface }]}>
            <Text style={[previewStyles.medRowName, { color: t.text }]}>—</Text>
            <Text style={[previewStyles.medRowTime, { color: t.accent }]}>--:--</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LargePreview({ snapshot, theme, showHijri, showTracker }: PreviewProps) {
  const t = THEMES[theme];
  const prayers = snapshot?.prayers ?? [];
  const DOTS = ['sabah', 'ogle', 'ikindi', 'aksam', 'yatsi'];
  return (
    <View style={[previewStyles.large, { backgroundColor: t.bg, borderColor: t.border }]}>
      <View style={previewStyles.largeTop}>
        <Text style={[previewStyles.largeBrand, { color: t.accent }]}>MIHRAB</Text>
        <Text numberOfLines={1} style={[previewStyles.largeLoc, { color: t.subtext }]}>
          {snapshot?.location ?? 'İstanbul'}
          {showHijri && snapshot?.hijriDate ? `  ·  ${snapshot.hijriDate}` : ''}
        </Text>
        <View style={[previewStyles.largeNextBadge, { backgroundColor: t.surface }]}>
          <Text style={[previewStyles.largeNextName, { color: t.text }]}>
            {snapshot?.nextPrayerName ?? 'Akşam'}
          </Text>
          <Text style={[previewStyles.largeNextTime, { color: t.accent }]}>
            {snapshot?.nextPrayerTime ?? '19:45'}
          </Text>
          <Text style={[previewStyles.largeRemain, { color: t.subtext }]}>
            {snapshot?.remainingLabel ?? '12 dk kaldı'}
          </Text>
        </View>
      </View>
      <View style={previewStyles.largeGrid}>
        {(prayers.length ? prayers.slice(0, 5) : DOTS.map((k) => ({ key: k, name: k === 'sabah' ? 'İmsak' : k === 'ogle' ? 'Öğle' : k === 'ikindi' ? 'İkindi' : k === 'aksam' ? 'Akşam' : 'Yatsı', time: '--:--', dateTime: '', isNext: false }))).map((p) => (
          <View key={p.key} style={[previewStyles.largeCell, { backgroundColor: t.surface }]}>
            <Text style={[previewStyles.largeCellName, { color: t.subtext }]}>{p.name}</Text>
            <Text style={[previewStyles.largeCellTime, { color: t.text }]}>{p.time}</Text>
          </View>
        ))}
      </View>
      {showTracker && (
        <View style={previewStyles.largeTracker}>
          <Text style={[previewStyles.largeTrackerLabel, { color: t.subtext }]}>BUGÜN</Text>
          <View style={previewStyles.largeDots}>
            {[1, 1, 1, 0, 0].map((done, i) => (
              <View key={i} style={[previewStyles.largeDot, { backgroundColor: done ? t.accent : t.surface }]} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Selector helpers ────────────────────────────────────────────────────────

type SizeTabProps = { value: WidgetSize; selected: WidgetSize; onPress: (v: WidgetSize) => void; label: string };
function SizeTab({ value, selected, onPress, label }: SizeTabProps) {
  const active = value === selected;
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[selectorStyles.sizeTab, active && selectorStyles.sizeTabActive]}>
      <Text style={[selectorStyles.sizeTabText, active && selectorStyles.sizeTabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

type ThemeDotProps = { value: WidgetTheme; selected: WidgetTheme; onPress: (v: WidgetTheme) => void; label: string; color: string };
function ThemeDot({ value, selected, onPress, label, color }: ThemeDotProps) {
  const active = value === selected;
  return (
    <Pressable onPress={() => onPress(value)} style={selectorStyles.themeDotWrap}>
      <View style={[selectorStyles.themeDot, { backgroundColor: color }, active && selectorStyles.themeDotActive]} />
      <Text style={[selectorStyles.themeDotLabel, active && selectorStyles.themeDotLabelActive]}>{label}</Text>
    </Pressable>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

function formatSync(value?: string) {
  if (!value) return 'Henüz senkron yok';
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export default function HomeWidgetScreen() {
  const router = useRouter();
  const { snapshot, nativeAvailable, loading, syncing, error, refresh } = useHomeWidget();

  const [settings, setSettings] = useState<WidgetSettings>({
    size: 'medium',
    theme: 'dark',
    showHijriDate: true,
    showTrackerDots: false,
  });

  useEffect(() => {
    loadWidgetSettings().then(setSettings);
  }, []);

  const updateSettings = useCallback((patch: Partial<WidgetSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveWidgetSettings(next);
      return next;
    });
  }, []);

  const previewProps: PreviewProps = {
    snapshot,
    theme: settings.theme,
    showHijri: settings.showHijriDate,
    showTracker: settings.showTrackerDots,
  };

  const platformBadge = Platform.OS === 'android'
    ? (nativeAvailable ? 'HAZIR' : 'ÖNİZLEME')
    : Platform.OS === 'ios' ? 'İOS SONRA' : 'WEB';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>‹ Geri</Text>
              </Pressable>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>YENİ NESİL</Text>
              </View>
            </View>
            <Text style={styles.eyebrow}>MIHRAB · WIDGET SİSTEMİ</Text>
            <Text style={styles.heroTitle}>Yeni nesil widget</Text>
            <Text style={styles.heroSub}>Boyut, tema ve içeriği dilediğin gibi özelleştir.</Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>

          {/* ── Size selector ── */}
          <Text style={styles.sectionLabel}>BOYUT</Text>
          <View style={selectorStyles.sizeRow}>
            <SizeTab value="small" selected={settings.size} onPress={(v) => updateSettings({ size: v })} label="Küçük" />
            <SizeTab value="medium" selected={settings.size} onPress={(v) => updateSettings({ size: v })} label="Orta" />
            <SizeTab value="large" selected={settings.size} onPress={(v) => updateSettings({ size: v })} label="Büyük" />
          </View>

          {/* ── Theme selector ── */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>TEMA</Text>
          <View style={selectorStyles.themeRow}>
            <ThemeDot value="dark" selected={settings.theme} onPress={(v) => updateSettings({ theme: v })} label="Koyu" color="#0F302A" />
            <ThemeDot value="light" selected={settings.theme} onPress={(v) => updateSettings({ theme: v })} label="Açık" color="#FFFFFF" />
            <ThemeDot value="minimal" selected={settings.theme} onPress={(v) => updateSettings({ theme: v })} label="Minimal" color="#111111" />
          </View>

          {/* ── Live preview ── */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>ÖNİZLEME</Text>
          <View style={styles.previewCard}>
            {settings.size === 'small' && <SmallPreview {...previewProps} />}
            {settings.size === 'medium' && <MediumPreview {...previewProps} />}
            {settings.size === 'large' && <LargePreview {...previewProps} />}
          </View>

          {/* ── Content toggles ── */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>İÇERİK</Text>
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleCopy}>
                <Text style={styles.toggleTitle}>Hicri tarih</Text>
                <Text style={styles.toggleSub}>Widget üzerinde Hicri tarihi göster</Text>
              </View>
              <Switch
                value={settings.showHijriDate}
                onValueChange={(v) => updateSettings({ showHijriDate: v })}
                trackColor={{ false: '#D8E3DD', true: '#1A594B' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.toggleRow, styles.toggleRowLast]}>
              <View style={styles.toggleCopy}>
                <Text style={styles.toggleTitle}>Takip noktaları</Text>
                <Text style={styles.toggleSub}>Bugün kılınan namazları göster (Büyük boyut)</Text>
              </View>
              <Switch
                value={settings.showTrackerDots}
                onValueChange={(v) => updateSettings({ showTrackerDots: v })}
                trackColor={{ false: '#D8E3DD', true: '#1A594B' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ── Sync card ── */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>VERİ</Text>
          <View style={styles.syncCard}>
            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <View style={styles.syncHeader}>
              <View>
                <Text style={styles.syncLabel}>SON VERİ</Text>
                <Text style={styles.syncTitle}>{snapshot?.nextPrayerName ?? 'Vakit bekleniyor'}</Text>
              </View>
              <Text style={styles.syncTime}>{snapshot?.nextPrayerTime ?? '--:--'}</Text>
            </View>
            <View style={styles.syncDivider} />
            {[
              ['Bölge', snapshot?.location ?? 'Henüz seçilmedi'],
              ['Senkron', formatSync(snapshot?.updatedAt)],
              ['Kaynak', 'Diyanet vakitleri'],
            ].map(([label, val]) => (
              <View key={label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{label}</Text>
                <Text numberOfLines={1} style={styles.metaValue}>{val}</Text>
              </View>
            ))}
            <Pressable
              disabled={syncing || loading}
              onPress={() => void refresh()}
              style={({ pressed }) => [styles.refreshBtn, (syncing || loading) && styles.refreshBtnDisabled, pressed && styles.pressed]}>
              {syncing || loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.refreshBtnText}>Widget verisini yenile</Text>
              }
            </Pressable>
          </View>

          {/* ── Setup steps ── */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>KURULUM</Text>
          <View style={styles.stepsCard}>
            {[
              "Yeni APK'yı telefona kur.",
              'Ana ekranda boş bir alana basılı tut.',
              "Widget'lar bölümünden MIHRAB Vakitleri kartını seç.",
              'İstediğin boyutu seçerek ana ekrana bırak.',
            ].map((step, i) => (
              <View key={step} style={[styles.stepRow, i < 3 && styles.stepRowBorder]}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Otomatik güncelleme</Text>
            <Text style={styles.infoText}>
              MIHRAB yeni Diyanet vakitlerini aldığında widget verisini cihaza kaydeder.
              Seçtiğin boyut ve tema APK içindeki native widget'a yansır.
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const previewStyles = StyleSheet.create({
  // Small
  small: { borderRadius: 18, borderWidth: 1, padding: 12, width: 200, alignSelf: 'center' },
  smallTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallBrand: { fontSize: 8, fontWeight: '900' },
  smallLoc: { fontSize: 8, maxWidth: 110 },
  smallNext: { fontSize: 22, fontWeight: '900', marginTop: 6 },
  smallBottom: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  smallTime: { fontSize: 18, fontWeight: '900' },
  smallRemain: { fontSize: 9 },

  // Medium
  medium: { borderRadius: 20, borderWidth: 1, padding: 13, width: 200, alignSelf: 'center' },
  medTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medBrand: { fontSize: 8, fontWeight: '900' },
  medDate: { fontSize: 7, maxWidth: 115, textAlign: 'right' },
  medNext: { fontSize: 20, fontWeight: '900', marginTop: 8 },
  medHeroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 2 },
  medTime: { fontSize: 17, fontWeight: '900' },
  medRemain: { fontSize: 8 },
  medDivider: { height: 0.5, marginVertical: 8 },
  medRows: { gap: 3 },
  medRow: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 8, paddingHorizontal: 7, minHeight: 18, alignItems: 'center' },
  medRowName: { fontSize: 7, fontWeight: '800' },
  medRowTime: { fontSize: 7, fontWeight: '900' },

  // Large
  large: { borderRadius: 22, borderWidth: 1, padding: 13, alignSelf: 'stretch' },
  largeTop: { gap: 4 },
  largeBrand: { fontSize: 8, fontWeight: '900' },
  largeLoc: { fontSize: 7 },
  largeNextBadge: { borderRadius: 10, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  largeNextName: { fontSize: 14, fontWeight: '900' },
  largeNextTime: { fontSize: 14, fontWeight: '900' },
  largeRemain: { fontSize: 8, marginLeft: 'auto' },
  largeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 },
  largeCell: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6, minWidth: 62, alignItems: 'center' },
  largeCellName: { fontSize: 7 },
  largeCellTime: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  largeTracker: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 10 },
  largeTrackerLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  largeDots: { flexDirection: 'row', gap: 5 },
  largeDot: { width: 10, height: 10, borderRadius: 5 },
});

const selectorStyles = StyleSheet.create({
  sizeRow: { flexDirection: 'row', gap: 8 },
  sizeTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 13, backgroundColor: '#FFFFFF' },
  sizeTabActive: { backgroundColor: '#1A594B' },
  sizeTabText: { fontSize: 12, fontWeight: '800', color: '#4A5E57' },
  sizeTabTextActive: { color: '#FFFFFF' },
  themeRow: { flexDirection: 'row', gap: 22 },
  themeDotWrap: { alignItems: 'center', gap: 6 },
  themeDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  themeDotActive: { borderColor: '#1A594B' },
  themeDotLabel: { fontSize: 10, fontWeight: '700', color: '#64736E' },
  themeDotLabelActive: { color: '#1A594B', fontWeight: '900' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6F2' },
  scrollContent: { paddingBottom: 125 },
  hero: { backgroundColor: '#123E36', borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' },
  heroSafe: { paddingBottom: 25, paddingHorizontal: 20 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10 },
  backText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  badge: { backgroundColor: 'rgba(113,200,155,0.18)', borderRadius: 13, paddingHorizontal: 11, paddingVertical: 8 },
  badgeText: { color: '#71C89B', fontSize: 8, fontWeight: '900' },
  eyebrow: { color: '#F1CF82', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 25 },
  heroTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '900', marginTop: 6 },
  heroSub: { color: '#BBD0C8', fontSize: 13, lineHeight: 20, marginTop: 7 },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: { color: '#1D6555', fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginBottom: 10 },
  previewCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, alignItems: 'center' },
  toggleCard: { backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: '#E8EEE9', borderBottomWidth: StyleSheet.hairlineWidth },
  toggleRowLast: { borderBottomWidth: 0 },
  toggleCopy: { flex: 1, marginRight: 12 },
  toggleTitle: { color: '#20312B', fontSize: 13, fontWeight: '800' },
  toggleSub: { color: '#71807A', fontSize: 10, marginTop: 2 },
  syncCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16 },
  errorCard: { backgroundColor: '#FFF4DF', borderRadius: 12, marginBottom: 12, padding: 12 },
  errorText: { color: '#765C28', fontSize: 10, lineHeight: 16 },
  syncHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  syncLabel: { color: '#1D6555', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  syncTitle: { color: '#263832', fontSize: 20, fontWeight: '900', marginTop: 3 },
  syncTime: { color: '#1A594B', fontSize: 24, fontWeight: '900' },
  syncDivider: { backgroundColor: '#E7ECE9', height: StyleSheet.hairlineWidth, marginVertical: 14 },
  metaRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 27 },
  metaLabel: { color: '#81908A', fontSize: 10, fontWeight: '800' },
  metaValue: { color: '#33443E', flex: 1, fontSize: 11, fontWeight: '800', marginLeft: 12, textAlign: 'right' },
  refreshBtn: { alignItems: 'center', backgroundColor: '#1A594B', borderRadius: 15, justifyContent: 'center', marginTop: 15, minHeight: 45 },
  refreshBtnDisabled: { opacity: 0.72 },
  refreshBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.82 },
  stepsCard: { backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden' },
  stepRow: { alignItems: 'center', flexDirection: 'row', minHeight: 62, paddingHorizontal: 15 },
  stepRowBorder: { borderBottomColor: '#E8EEEA', borderBottomWidth: StyleSheet.hairlineWidth },
  stepNum: { alignItems: 'center', backgroundColor: '#E8F1EC', borderRadius: 13, height: 28, justifyContent: 'center', marginRight: 11, width: 28 },
  stepNumText: { color: '#1A594B', fontSize: 11, fontWeight: '900' },
  stepText: { color: '#35453F', flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  infoCard: { backgroundColor: '#FFF5E4', borderRadius: 19, marginTop: 17, padding: 17 },
  infoTitle: { color: '#6E5423', fontSize: 14, fontWeight: '900' },
  infoText: { color: '#7D6A43', fontSize: 11, lineHeight: 17, marginTop: 6 },
});
