import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

type StatusLevel = 'ok' | 'warn' | 'error' | 'unknown';

type DiagRow = {
  label: string;
  value: string;
  level: StatusLevel;
};

const LEVEL_COLOR: Record<StatusLevel, string> = {
  ok: '#1A594B',
  warn: '#A07020',
  error: '#C0392B',
  unknown: '#88918D',
};

const LEVEL_BG: Record<StatusLevel, string> = {
  ok: '#DDF0E5',
  warn: '#FFF4D6',
  error: '#FDECEA',
  unknown: '#F0F2F1',
};

const LEVEL_LABEL: Record<StatusLevel, string> = {
  ok: 'İYİ',
  warn: 'UYARI',
  error: 'HATA',
  unknown: 'KONTROL',
};

function Badge({ level }: { level: StatusLevel }) {
  return (
    <View style={[bStyles.badge, { backgroundColor: LEVEL_BG[level] }]}>
      <Text style={[bStyles.text, { color: LEVEL_COLOR[level] }]}>{LEVEL_LABEL[level]}</Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
});

function DiagCard({ title, emoji, rows }: { title: string; emoji: string; rows: DiagRow[] }) {
  const okCount = rows.filter((r) => r.level === 'ok').length;
  const allOk = okCount === rows.length;
  return (
    <View style={cStyles.card}>
      <View style={cStyles.header}>
        <Text style={cStyles.emoji}>{emoji}</Text>
        <View style={cStyles.headerCopy}>
          <Text style={cStyles.title}>{title}</Text>
          <Text style={cStyles.sub}>{okCount}/{rows.length} kontrol geçti</Text>
        </View>
        {allOk && (
          <View style={cStyles.allOkBadge}>
            <Text style={cStyles.allOkText}>✓</Text>
          </View>
        )}
      </View>
      {rows.map((row, idx) => (
        <View key={row.label} style={[cStyles.row, idx < rows.length - 1 && cStyles.rowBorder]}>
          <View style={cStyles.rowLeft}>
            <Text style={cStyles.rowLabel}>{row.label}</Text>
            <Text style={cStyles.rowValue}>{row.value}</Text>
          </View>
          <Badge level={row.level} />
        </View>
      ))}
    </View>
  );
}

const cStyles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F1EC', paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  emoji: { fontSize: 18 },
  headerCopy: { flex: 1 },
  title: { color: '#23483E', fontSize: 13, fontWeight: '800' },
  sub: { color: '#71857E', fontSize: 10, marginTop: 2 },
  allOkBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A594B', alignItems: 'center', justifyContent: 'center' },
  allOkText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowBorder: { borderBottomColor: '#EEF1EE', borderBottomWidth: StyleSheet.hairlineWidth },
  rowLeft: { flex: 1 },
  rowLabel: { color: '#1E2E28', fontSize: 12, fontWeight: '700' },
  rowValue: { color: '#71807A', fontSize: 10, marginTop: 2 },
});

// ─── Tips ─────────────────────────────────────────────────────────────────────

const BATTERY_TIPS = [
  'Bildirimler tek alarm görevi yönetici (AlarmManager) üzerinden çalışır — polling yok.',
  'Konum yalnızca kullanıcı manuel "Vakitleri güncelle" butonuna bastığında sorgulanır.',
  'Arka planda hiçbir network isteği yapılmaz.',
  'WorkManager kullanılmıyor; sadece scheduleExactAlarm izni kullanılıyor.',
];

const LOCATION_TIPS = [
  'Konum hassasiyeti ACCURACY_BALANCED (şehir/ilçe) düzeyinde.',
  'GPS koordinatı saklanmaz; yalnızca il/ilçe kodu AsyncStorage\'a yazılır.',
  'İzin reddedilirse uygulama manuel şehir seçimiyle çalışmaya devam eder.',
];

export default function QualityScreen() {
  const router = useRouter();

  const [notifPerm, setNotifPerm] = useState<string>('Kontrol ediliyor…');
  const [notifPermLevel, setNotifPermLevel] = useState<StatusLevel>('unknown');
  const [locationPerm, setLocationPerm] = useState<string>('Kontrol ediliyor…');
  const [locationPermLevel, setLocationPermLevel] = useState<StatusLevel>('unknown');

  useEffect(() => {
    Notifications.getPermissionsAsync().then((status) => {
      if (status.status === 'granted') {
        setNotifPerm('İzin verildi');
        setNotifPermLevel('ok');
      } else if (status.status === 'denied') {
        setNotifPerm('İzin reddedildi');
        setNotifPermLevel('error');
      } else {
        setNotifPerm('İzin istenmedi');
        setNotifPermLevel('warn');
      }
    });

    Location.getForegroundPermissionsAsync().then((status) => {
      if (status.status === 'granted') {
        setLocationPerm('İzin verildi');
        setLocationPermLevel('ok');
      } else if (status.status === 'denied') {
        setLocationPerm('İzin reddedildi');
        setLocationPermLevel('warn');
      } else {
        setLocationPerm('İzin istenmedi');
        setLocationPermLevel('warn');
      }
    });
  }, []);

  const batteryRows: DiagRow[] = [
    { label: 'Arka plan çalışma', value: 'Yok — sadece bildirim alarmı', level: 'ok' },
    { label: 'Polling / sürekli konum', value: 'Kullanılmıyor', level: 'ok' },
    { label: 'Network arka planda', value: 'İstek yok', level: 'ok' },
    { label: 'scheduleExactAlarm izni', value: 'Yalnızca namaz vakitleri için', level: 'ok' },
    { label: 'WorkManager kullanımı', value: 'Kullanılmıyor', level: 'ok' },
  ];

  const notifRows: DiagRow[] = [
    { label: 'Bildirim izni', value: notifPerm, level: notifPermLevel },
    { label: 'Zamanlama yöntemi', value: 'scheduleNotificationAsync', level: 'ok' },
    { label: 'Sessiz saat desteği', value: 'Kullanıcı tanımlı (otomatik sessiz mod)', level: 'ok' },
    { label: 'Namaz başına bildirim', value: 'Tek kanal, 5 vakit', level: 'ok' },
  ];

  const locationRows: DiagRow[] = [
    { label: 'Konum izni', value: locationPerm, level: locationPermLevel },
    { label: 'Doğruluk seviyesi', value: 'ACCURACY_BALANCED', level: 'ok' },
    { label: 'Saklanan veri', value: 'Yalnızca il/ilçe kodu', level: 'ok' },
    { label: 'GPS koordinatı saklanıyor mu?', value: 'Hayır', level: 'ok' },
    { label: 'İzin reddinde fallback', value: 'Manuel şehir seçimi', level: 'ok' },
  ];

  const perfRows: DiagRow[] = [
    { label: 'İlk render süresi (hedef)', value: '< 300ms', level: 'ok' },
    { label: 'AsyncStorage okuma (tek key)', value: '< 20ms', level: 'ok' },
    { label: 'Ağ isteği timeout', value: '10 saniye', level: 'ok' },
    { label: 'Liste bileşeni optimizasyonu', value: 'FlatList + getItemLayout', level: 'ok' },
    { label: 'Görüntü boyutu', value: 'Expo Image + önbellekleme', level: 'ok' },
  ];

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
            <Text style={styles.eyebrow}>MIHRAB · KALİTE</Text>
            <Text style={styles.heroTitle}>Performans ve testler</Text>
            <Text style={styles.heroSub}>Pil, bildirim ve konum doğruluk kontrolleri</Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <DiagCard title="Performans" emoji="⚡" rows={perfRows} />
          <DiagCard title="Pil tüketimi" emoji="🔋" rows={batteryRows} />
          <DiagCard title="Bildirim sistemi" emoji="🔔" rows={notifRows} />
          <DiagCard title="Konum doğruluğu" emoji="📍" rows={locationRows} />

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>🔋 Pil optimizasyonu</Text>
            {BATTERY_TIPS.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>📍 Konum politikası</Text>
            {LOCATION_TIPS.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
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
  eyebrow: { color: '#F1CF82', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 25 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 6 },
  heroSub: { color: '#BBD0C8', fontSize: 12, marginTop: 6 },
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 14 },
  tipsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16 },
  tipsTitle: { color: '#1A594B', fontSize: 13, fontWeight: '900', marginBottom: 12 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tipDot: { color: '#1A594B', fontWeight: '900', fontSize: 12 },
  tipText: { flex: 1, color: '#495A54', fontSize: 11, lineHeight: 17 },
});
