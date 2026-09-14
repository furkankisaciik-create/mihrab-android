import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type CheckItem = { id: string; label: string; detail: string; done: boolean };

type CheckGroup = { title: string; emoji: string; items: CheckItem[] };

const GROUPS: CheckGroup[] = [
  {
    title: 'Uygulama kimliği',
    emoji: '🪪',
    items: [
      { id: 'app_id', label: 'Application ID tanımlandı', detail: 'com.mihrab.app', done: true },
      { id: 'version_code', label: 'versionCode / versionName güncellendi', detail: '1 / 1.0.0', done: true },
      { id: 'app_name', label: 'Uygulama adı Türkçe + İngilizce hazır', done: true, detail: 'MIHRAB & MIHRAB Prayer' },
      { id: 'signing', label: 'Release keystore oluşturuldu', detail: 'mihrab-release.jks', done: false },
    ],
  },
  {
    title: 'Mağaza varlıkları',
    emoji: '🖼',
    items: [
      { id: 'icon', label: 'Uygulama ikonu (512×512 PNG)', done: false, detail: 'Yüklenmedi' },
      { id: 'feature', label: 'Feature graphic (1024×500 PNG)', done: false, detail: 'Yüklenmedi' },
      { id: 'screenshots_phone', label: 'Telefon ekran görüntüleri (min 2)', done: false, detail: 'Yüklenmedi' },
      { id: 'short_desc', label: 'Kısa açıklama (≤80 karakter)', done: true, detail: 'Hazır' },
      { id: 'full_desc', label: 'Uzun açıklama (≤4000 karakter)', done: true, detail: 'Hazır' },
    ],
  },
  {
    title: 'İçerik derecelendirme',
    emoji: '📋',
    items: [
      { id: 'content_rating', label: 'Content rating anketi tamamlandı', done: false, detail: 'Play Console\'da doldurulacak' },
      { id: 'target_age', label: 'Hedef yaş grubu belirlendi (Herkes)', done: true, detail: 'Herkes — 4+' },
      { id: 'policy', label: 'Gizlilik politikası URL\'si hazır', done: true, detail: 'Uygulama içinde mevcut' },
    ],
  },
  {
    title: 'Teknik hazırlık',
    emoji: '⚙️',
    items: [
      { id: 'aab', label: 'Android App Bundle (.aab) oluşturuldu', done: false, detail: 'eas build komutuyla üretilecek' },
      { id: 'proguard', label: 'ProGuard / R8 kuralları eklendi', done: false, detail: 'Expo otomatik yönetir' },
      { id: 'permissions', label: 'Manifest izinleri minimuma indirildi', done: true, detail: 'Konum + bildirim' },
      { id: 'api_key', label: 'API anahtarları production değerleri', done: false, detail: 'Kontrol edilecek' },
      { id: 'network', label: 'cleartext traffic devre dışı (HTTPS only)', done: true, detail: 'Tüm istekler HTTPS' },
    ],
  },
  {
    title: 'Test & kalite',
    emoji: '🧪',
    items: [
      { id: 'internal_test', label: 'Internal test (≥5 cihaz) tamamlandı', done: false, detail: 'Beklemede' },
      { id: 'closed_test', label: 'Kapalı test (20 kişi) tamamlandı', done: false, detail: 'Beklemede' },
      { id: 'crash_free', label: 'Crash-free rate ≥%99', done: false, detail: 'Ölçülecek' },
      { id: 'anr_free', label: 'ANR rate <%0,47', done: false, detail: 'Ölçülecek' },
      { id: 'critical_bugs', label: 'Kritik hata bulunmuyor', done: false, detail: 'Kapalı test sonrası' },
    ],
  },
  {
    title: 'Yayın',
    emoji: '🚀',
    items: [
      { id: 'play_console', label: 'Play Console hesabı aktif', done: false, detail: 'Developer hesabı gerekli' },
      { id: 'staged_rollout', label: 'Staged rollout planlandı (%10 → %50 → %100)', done: true, detail: 'Plan hazır' },
      { id: 'release_notes', label: 'Sürüm notları Türkçe + İngilizce hazır', done: true, detail: 'Hazır' },
    ],
  },
];

type ToggleState = Record<string, boolean>;

function buildInitial(): ToggleState {
  const state: ToggleState = {};
  for (const g of GROUPS) for (const item of g.items) state[item.id] = item.done;
  return state;
}

function Progress({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <View style={pStyles.wrap}>
      <View style={pStyles.header}>
        <Text style={pStyles.label}>Toplam ilerleme</Text>
        <Text style={pStyles.value}>{pct}%</Text>
      </View>
      <View style={pStyles.track}>
        <View style={[pStyles.fill, { width: `${pct}%` as ViewStyle['width'] }]} />
      </View>
      <Text style={pStyles.detail}>{done} / {total} madde tamamlandı</Text>
    </View>
  );
}

const pStyles = StyleSheet.create({
  wrap: { backgroundColor: '#123E36', borderRadius: 22, padding: 19, marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  value: { color: '#F1CF82', fontSize: 22, fontWeight: '800' },
  track: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 8, height: 7, marginTop: 14, overflow: 'hidden' },
  fill: { backgroundColor: '#F1CF82', borderRadius: 8, height: '100%' },
  detail: { color: '#AFC9C0', fontSize: 11, marginTop: 9 },
});

export default function ReleaseScreen() {
  const router = useRouter();
  const [checks, setChecks] = useState<ToggleState>(buildInitial);

  const totalItems = GROUPS.reduce((s, g) => s + g.items.length, 0);
  const doneItems = Object.values(checks).filter(Boolean).length;

  function toggle(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>‹ Geri</Text>
              </Pressable>
            </View>
            <Text style={styles.eyebrow}>MIHRAB · YAYIN</Text>
            <Text style={styles.heroTitle}>Google Play hazırlığı</Text>
            <Text style={styles.heroSub}>Yayına çıkmadan önce tüm maddeleri tamamlayın</Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <Progress done={doneItems} total={totalItems} />

          {GROUPS.map((group) => {
            const groupDone = group.items.filter((i) => checks[i.id]).length;
            return (
              <View key={group.title} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupEmoji}>{group.emoji}</Text>
                  <View style={styles.groupHeaderCopy}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <Text style={styles.groupProgress}>{groupDone}/{group.items.length} tamamlandı</Text>
                  </View>
                  <View style={[styles.groupBadge, groupDone === group.items.length && styles.groupBadgeDone]}>
                    <Text style={[styles.groupBadgeText, groupDone === group.items.length && styles.groupBadgeTextDone]}>
                      {groupDone === group.items.length ? '✓' : `${group.items.length - groupDone}`}
                    </Text>
                  </View>
                </View>

                {group.items.map((item, idx) => (
                  <Pressable
                    key={item.id}
                    onPress={() => toggle(item.id)}
                    style={({ pressed }) => [
                      styles.checkRow,
                      idx < group.items.length - 1 && styles.checkRowBorder,
                      pressed && styles.pressed,
                    ]}>
                    <View style={[styles.checkbox, checks[item.id] && styles.checkboxDone]}>
                      {checks[item.id] && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <View style={styles.checkCopy}>
                      <Text style={[styles.checkLabel, checks[item.id] && styles.checkLabelDone]}>{item.label}</Text>
                      <Text style={styles.checkDetail}>{item.detail}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            );
          })}
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
  eyebrow: { color: '#F1CF82', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 25 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 6 },
  heroSub: { color: '#BBD0C8', fontSize: 12, marginTop: 6 },
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 14 },
  groupCard: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F1EC', paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  groupEmoji: { fontSize: 18 },
  groupHeaderCopy: { flex: 1 },
  groupTitle: { color: '#23483E', fontSize: 13, fontWeight: '800' },
  groupProgress: { color: '#71857E', fontSize: 10, marginTop: 2 },
  groupBadge: { backgroundColor: '#FFFFFF', borderRadius: 12, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  groupBadgeDone: { backgroundColor: '#1A594B' },
  groupBadgeText: { color: '#1A594B', fontSize: 11, fontWeight: '900' },
  groupBadgeTextDone: { color: '#FFFFFF' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 13, gap: 13 },
  checkRowBorder: { borderBottomColor: '#EEF1EE', borderBottomWidth: StyleSheet.hairlineWidth },
  pressed: { backgroundColor: '#F8FAF9' },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: '#C0CCC8', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxDone: { backgroundColor: '#1A594B', borderColor: '#1A594B' },
  checkMark: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  checkCopy: { flex: 1 },
  checkLabel: { color: '#1E2E28', fontSize: 12, fontWeight: '700', lineHeight: 17 },
  checkLabelDone: { color: '#71807A', textDecorationLine: 'line-through' },
  checkDetail: { color: '#9BABA5', fontSize: 10, marginTop: 2 },
});
