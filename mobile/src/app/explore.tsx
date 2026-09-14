import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COMPLETED = [
  'Konuma göre namaz vakitleri',
  'Namaz vakti bildirimleri',
  'Kıble pusulası',
  'Günlük ayet sistemi',
  'Günlük hadis sistemi',
  'Zikir sayacı',
  'Namaz takibi',
  'Kaza namazı takibi',
  'Dua kütüphanesi',
  'Favori dualar',
  'Kur\u2019an-ı Kerim modülü',
  'Hicri takvim',
  'Dini günler ve geceler',
  'Ramazan imsakiyesi',
  'Yakındaki camiler',
  'Otomatik sessiz mod',
  "Ana ekran widget'ı",
  'Türkçe dil desteği',
  'İngilizce dil desteği',
  'Arapça dil desteği',
  'MIHRAB AI',
  'Premium üyelik sistemi',
  'Aile / Cemaat sistemi',
  'Gelişmiş istatistikler',
  'Yeni nesil widget sistemi',
  'Kullanıcı profil sistemi',
  'Veri yedekleme ve senkronizasyon',
  'KVKK ve gizlilik politikaları',
  'Google Play yayın hazırlıkları',
  'Performans ve güvenlik testleri',
  'Pil tüketimi optimizasyonu',
  'Bildirim ve konum doğruluk testleri',
];

const RELEASE_CRITERIA = [
  'Tüm hedeflerin yüzde 100 tamamlanması',
  'Kritik hata bulunmaması',
  '20 kişilik kapalı testin tamamlanması',
  '100 kişilik beta testin tamamlanması',
  'Tüm geri bildirimlerin işlenmesi',
  'Google Play yayın paketinin hazır olması',
];

export default function RoadmapScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>MIHRAB NİHAİ PLANI</Text>
          <Text style={styles.title}>Yayın öncesi yol haritası</Text>
          <Text style={styles.subtitle}>
            Genel yayın için listedeki bütün hedefler ve test kriterleri tamamlanacak.
          </Text>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Toplam ilerleme</Text>
                <Text style={styles.progressDetail}>32 / 32 ana hedef</Text>
              </View>
              <Text style={styles.progressValue}>%100</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>
              Tüm hedefler tamamlandı — yayına hazır!
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Tamamlananlar</Text>
          <View style={styles.completedCard}>
            {COMPLETED.map((item) => (
              <View key={item} style={styles.completedRow}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <Text style={styles.completedText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.allDoneCard}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <Text style={styles.allDoneTitle}>Tüm hedefler tamamlandı!</Text>
            <Text style={styles.allDoneBody}>
              32 / 32 madde tamamlandı. MIHRAB yayına hazır.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Yayına çıkış kriteri</Text>
          <View style={styles.criteriaCard}>
            {RELEASE_CRITERIA.map((criterion) => (
              <View key={criterion} style={styles.criteriaRow}>
                <View style={styles.emptyCheck} />
                <Text style={styles.criteriaText}>{criterion}</Text>
              </View>
            ))}
            <View style={styles.criteriaNote}>
              <Text style={styles.criteriaNoteText}>
                Tüm teknik hedefler tamamlandı. Test süreci ve mağaza başvurusu ekibin onayıyla başlatılabilir.
              </Text>
            </View>
          </View>

          <View style={styles.strategyCard}>
            <Text style={styles.strategyLabel}>YAYIN SONRASI</Text>
            <Text style={styles.strategyTitle}>Yeni temel özellik eklenmeyecek</Text>
            <Text style={styles.strategyText}>
              Odak; mevcut sistemleri geliştirmek, performansı artırmak, yeni içerikler eklemek
              ve kullanıcı deneyimini iyileştirmek olacak.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6F2',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 125,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  eyebrow: {
    color: '#1D6555',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.9,
  },
  title: {
    color: '#182723',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 7,
  },
  subtitle: {
    color: '#64736E',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  progressCard: {
    backgroundColor: '#123E36',
    borderRadius: 22,
    marginTop: 23,
    padding: 19,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  progressDetail: {
    color: '#AFC9C0',
    fontSize: 11,
    marginTop: 3,
  },
  progressValue: {
    color: '#F1CF82',
    fontSize: 22,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    height: 7,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#F1CF82',
    borderRadius: 8,
    height: '100%',
  },
  progressText: {
    color: '#BBD0C8',
    fontSize: 11,
    marginTop: 11,
  },
  sectionTitle: {
    color: '#1C2A26',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 13,
    marginTop: 25,
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  completedRow: {
    alignItems: 'center',
    borderBottomColor: '#E7EDE9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 49,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: '#DDEDE5',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    marginRight: 11,
    width: 22,
  },
  checkText: {
    color: '#1C6957',
    fontSize: 12,
    fontWeight: '900',
  },
  completedText: {
    color: '#2B3B35',
    fontSize: 13,
    fontWeight: '700',
  },
  allDoneCard: {
    backgroundColor: '#123E36',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 8,
  },
  allDoneEmoji: { fontSize: 36 },
  allDoneTitle: { color: '#F1CF82', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  allDoneBody: { color: '#AFC9C0', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  criteriaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  criteriaRow: {
    alignItems: 'center',
    borderBottomColor: '#E8EEEA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 48,
  },
  emptyCheck: {
    borderColor: '#91A29C',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 20,
    marginRight: 11,
    width: 20,
  },
  criteriaText: {
    color: '#495A54',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  strategyCard: {
    backgroundColor: '#FFF5E4',
    borderRadius: 19,
    marginTop: 17,
    padding: 17,
  },
  strategyLabel: {
    color: '#9A7026',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  strategyTitle: {
    color: '#6E5423',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5,
  },
  strategyText: {
    color: '#7D6A43',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
  criteriaNote: {
    borderTopColor: '#E8EEEA',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  criteriaNoteText: {
    color: '#71807A',
    fontSize: 10,
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
