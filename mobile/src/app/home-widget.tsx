import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { HomeWidgetMockup } from '@/components/home-widget-preview';
import { useHomeWidget } from '@/hooks/use-home-widget';

function platformStatus(nativeAvailable: boolean) {
  if (Platform.OS === 'android') {
    return nativeAvailable
      ? {
          title: 'Android widget senkronize',
          text: "APK içinde MIHRAB widget'ı telefonun Widget'lar menüsünde görünür.",
          badge: 'HAZIR',
        }
      : {
          title: 'Native widget APK’da açılır',
          text: 'Expo Go ve web önizleme gerçek Android widget uzantısını yükleyemez.',
          badge: 'ÖNİZLEME',
        };
  }

  if (Platform.OS === 'ios') {
    return {
      title: 'iOS WidgetKit sonraki aşama',
      text: 'iPhone ana ekran widget’ı için Xcode/WidgetKit extension gerekir.',
      badge: 'İOS SONRA',
    };
  }

  return {
    title: 'Web önizleme aktif',
    text: "Bu ekranda widget verisini ve tasarımını kontrol ediyoruz; gerçek widget APK'da çalışır.",
    badge: 'WEB',
  };
}

function formatUpdatedAt(value?: string) {
  if (!value) {
    return 'Henüz senkron yok';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function HomeWidgetScreen() {
  const router = useRouter();
  const { snapshot, nativeAvailable, loading, syncing, error, refresh } =
    useHomeWidget();
  const status = platformStatus(nativeAvailable);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Ana ekrana dön"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={styles.heroButton}>
                <Text style={styles.heroButtonText}>‹ Geri</Text>
              </Pressable>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{status.badge}</Text>
              </View>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · GÜNLÜK KULLANIM</Text>
            <Text style={styles.heroTitle}>Ana ekran widget’ı</Text>
            <Text style={styles.heroSubtitle}>
              Diyanet vakitlerinden sıradaki namazı, kalan süreyi ve yakındaki
              vakitleri telefonun ana ekranında göster.
            </Text>

            <View style={styles.mockupShell}>
              <HomeWidgetMockup snapshot={snapshot} large />
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Text style={styles.statusIconText}>W</Text>
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>{status.title}</Text>
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.syncCard}>
            <View style={styles.syncHeader}>
              <View>
                <Text style={styles.syncLabel}>SON VERİ</Text>
                <Text style={styles.syncTitle}>
                  {snapshot?.nextPrayerName ?? 'Vakit bekleniyor'}
                </Text>
              </View>
              <Text style={styles.syncTime}>
                {snapshot?.nextPrayerTime ?? '--:--'}
              </Text>
            </View>

            <View style={styles.syncDivider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Bölge</Text>
              <Text numberOfLines={1} style={styles.metaValue}>
                {snapshot?.location ?? 'Henüz seçilmedi'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Senkron</Text>
              <Text style={styles.metaValue}>
                {formatUpdatedAt(snapshot?.updatedAt)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Kaynak</Text>
              <Text style={styles.metaValue}>Diyanet vakitleri</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={syncing || loading}
              onPress={() => void refresh()}
              style={({ pressed }) => [
                styles.refreshButton,
                (syncing || loading) && styles.refreshButtonDisabled,
                pressed && styles.pressed,
              ]}>
              {syncing || loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.refreshButtonText}>Widget verisini yenile</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>TELEFONDA KURULUM</Text>
            <Text style={styles.sectionTitle}>Android ana ekranına ekle</Text>
          </View>

          <View style={styles.stepsCard}>
            {[
              "Yeni APK'yı telefona kur.",
              'Ana ekranda boş bir alana basılı tut.',
              "Widget'lar bölümünden MIHRAB Vakitleri kartını seç.",
              'Kartı ana ekrana bırak; uygulama açıldıkça vakitler yenilenir.',
            ].map((step, index) => (
              <View
                key={step}
                style={[
                  styles.stepRow,
                  index !== 3 && styles.stepRowBorder,
                ]}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Nasıl güncellenir?</Text>
            <Text style={styles.infoText}>
              MIHRAB yeni Diyanet vakitlerini aldığında widget verisini cihaza
              kaydeder. Android ayrıca widget’ı belli aralıklarla yeniden çizer;
              kalan süre bilgisi bu sırada tazelenir.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#F3F6F2',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 125,
  },
  hero: {
    backgroundColor: '#123E36',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  heroButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroBadge: {
    backgroundColor: 'rgba(241,207,130,0.16)',
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  heroBadgeText: {
    color: '#F1CF82',
    fontSize: 8,
    fontWeight: '900',
  },
  eyebrow: {
    color: '#F1CF82',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 25,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
    marginTop: 6,
  },
  heroSubtitle: {
    color: '#BBD0C8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  mockupShell: {
    marginTop: 22,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    flexDirection: 'row',
    padding: 16,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F1EC',
    borderRadius: 16,
    height: 45,
    justifyContent: 'center',
    marginRight: 12,
    width: 45,
  },
  statusIconText: {
    color: '#1A594B',
    fontSize: 18,
    fontWeight: '900',
  },
  statusCopy: {
    flex: 1,
  },
  statusTitle: {
    color: '#20312B',
    fontSize: 15,
    fontWeight: '900',
  },
  statusText: {
    color: '#71807A',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  noticeCard: {
    backgroundColor: '#FFF4DF',
    borderRadius: 15,
    marginTop: 12,
    padding: 13,
  },
  noticeText: {
    color: '#765C28',
    fontSize: 10,
    lineHeight: 16,
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 14,
    padding: 16,
  },
  syncHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syncLabel: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  syncTitle: {
    color: '#263832',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },
  syncTime: {
    color: '#1A594B',
    fontSize: 24,
    fontWeight: '900',
  },
  syncDivider: {
    backgroundColor: '#E7ECE9',
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 27,
  },
  metaLabel: {
    color: '#81908A',
    fontSize: 10,
    fontWeight: '800',
  },
  metaValue: {
    color: '#33443E',
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 12,
    textAlign: 'right',
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 15,
    justifyContent: 'center',
    marginTop: 15,
    minHeight: 45,
  },
  refreshButtonDisabled: {
    opacity: 0.72,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
  sectionHeader: {
    marginTop: 25,
  },
  sectionEyebrow: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: '#20312B',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 12,
    overflow: 'hidden',
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 62,
    paddingHorizontal: 15,
  },
  stepRowBorder: {
    borderBottomColor: '#E8EEEA',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: '#E8F1EC',
    borderRadius: 13,
    height: 28,
    justifyContent: 'center',
    marginRight: 11,
    width: 28,
  },
  stepNumberText: {
    color: '#1A594B',
    fontSize: 11,
    fontWeight: '900',
  },
  stepText: {
    color: '#35453F',
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  infoCard: {
    backgroundColor: '#FFF5E4',
    borderRadius: 19,
    marginTop: 17,
    padding: 17,
  },
  infoTitle: {
    color: '#6E5423',
    fontSize: 14,
    fontWeight: '900',
  },
  infoText: {
    color: '#7D6A43',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
});
