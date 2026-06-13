import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { DailyContentSwitcher } from '@/components/daily-content-switcher';
import { DailyHadithView } from '@/components/daily-hadith-view';
import { useDailyVerse } from '@/hooks/use-daily-verse';
import { formatDailyVerseDate } from '@/services/daily-verse';

export default function DailyContentScreen() {
  const { view } = useLocalSearchParams<{ view?: string }>();

  if (view === 'hadith') {
    return <DailyHadithView />;
  }

  return <DailyVerseScreen />;
}

function DailyVerseScreen() {
  const { verse, dateKey, loading, refreshing, error, notice, refresh } = useDailyVerse();

  const shareVerse = async () => {
    if (!verse) {
      return;
    }

    await Share.share({
      message: `${verse.translation}\n\n${verse.surahName} Suresi, ${verse.verseNumber}. Ayet\n${verse.sourceUrl}`,
      title: 'MIHRAB - Günün Ayeti',
    });
  };

  const statusLabel = verse?.isFallback
    ? 'Çevrimdışı'
    : verse?.isCached
      ? 'Kayıtlı'
      : 'Güncel';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#FFFFFF" />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.eyebrow}>MIHRAB · GÜNLÜK İÇERİK</Text>
                <Text style={styles.title}>Günün ayeti</Text>
              </View>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    verse?.isFallback && styles.statusDotFallback,
                    verse?.isCached && styles.statusDotCached,
                  ]}
                />
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={styles.date}>{formatDailyVerseDate(dateKey)}</Text>
            <Text style={styles.renewal}>Her gün Türkiye saatiyle 00.00’da yenilenir</Text>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <DailyContentSwitcher selected="verse" />

          {notice && (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading && !verse ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#1A594B" size="large" />
              <Text style={styles.loadingText}>Bugünün ayeti hazırlanıyor</Text>
            </View>
          ) : verse ? (
            <>
              <View style={styles.referenceRow}>
                <View style={styles.referenceBadge}>
                  <Text style={styles.referenceBadgeText}>{verse.surahNumber}</Text>
                </View>
                <View>
                  <Text style={styles.surahName}>{verse.surahName} Suresi</Text>
                  <Text style={styles.verseNumber}>{verse.verseNumber}. Ayet</Text>
                </View>
              </View>

              <View style={styles.arabicCard}>
                <Text
                  accessibilityLanguage="ar"
                  selectable
                  style={styles.arabicText}>
                  {verse.arabicText}
                </Text>
              </View>

              <View style={styles.translationCard}>
                <Text style={styles.translationLabel}>TÜRKÇE ANLAMI</Text>
                <Text selectable style={styles.translationText}>
                  {verse.translation}
                </Text>
                {verse.footnotes ? (
                  <View style={styles.footnoteArea}>
                    <Text style={styles.footnoteLabel}>Açıklama</Text>
                    <Text selectable style={styles.footnoteText}>
                      {verse.footnotes}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={shareVerse}
                style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
                <Text style={styles.shareButtonText}>Ayeti paylaş</Text>
              </Pressable>

              <View style={styles.sourceCard}>
                <Text style={styles.sourceEyebrow}>KAYNAK VE SÜRÜM</Text>
                <Text style={styles.sourceTitle}>{verse.translationTitle}</Text>
                <Text style={styles.sourceVersion}>Sürüm {verse.translationVersion}</Text>
                <Text style={styles.sourceText}>
                  Arapça metin ve Türkçe meal Kur’an Mealleri Ansiklopedisi API’sinden,
                  içerik değiştirilmeden gösterilir.
                </Text>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(verse.sourceUrl)}
                  style={({ pressed }) => [styles.sourceLink, pressed && styles.pressed]}>
                  <Text style={styles.sourceLinkText}>Kaynakta aç</Text>
                  <Text style={styles.sourceLinkArrow}>›</Text>
                </Pressable>
              </View>

              <Text style={styles.disclaimer}>
                Meal, Kur’an-ı Kerim’in anlamını Türkçeye aktaran bir tercümedir. Ayetin
                bağlamı için sure bütünlüğü içinde okunması tavsiye edilir.
              </Text>
            </>
          ) : null}
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingBottom: 30,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#A7C7BB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
    marginTop: 4,
  },
  statusBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  statusDot: {
    backgroundColor: '#65C7A6',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusDotCached: {
    backgroundColor: '#F1CF82',
  },
  statusDotFallback: {
    backgroundColor: '#DFA777',
  },
  statusText: {
    color: '#E6F1ED',
    fontSize: 10,
    fontWeight: '800',
  },
  date: {
    color: '#F1CF82',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 28,
    textTransform: 'capitalize',
  },
  renewal: {
    color: '#ABC6BC',
    fontSize: 11,
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  noticeCard: {
    backgroundColor: '#FFF5D9',
    borderRadius: 14,
    marginBottom: 14,
    padding: 13,
  },
  noticeText: {
    color: '#735E27',
    fontSize: 11,
    lineHeight: 17,
  },
  errorCard: {
    backgroundColor: '#FFF1ED',
    borderRadius: 14,
    marginBottom: 14,
    padding: 13,
  },
  errorText: {
    color: '#82483C',
    fontSize: 11,
    lineHeight: 17,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    minHeight: 220,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#60716B',
    fontSize: 12,
    marginTop: 13,
  },
  referenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  referenceBadge: {
    alignItems: 'center',
    backgroundColor: '#DCEBE4',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42,
  },
  referenceBadgeText: {
    color: '#1A594B',
    fontSize: 13,
    fontWeight: '900',
  },
  surahName: {
    color: '#1D2D28',
    fontSize: 18,
    fontWeight: '800',
  },
  verseNumber: {
    color: '#75847F',
    fontSize: 11,
    marginTop: 2,
  },
  arabicCard: {
    backgroundColor: '#174D42',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  arabicText: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 53,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 15,
    padding: 19,
  },
  translationLabel: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  translationText: {
    color: '#2A3934',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 12,
  },
  footnoteArea: {
    borderTopColor: '#E5EBE8',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 17,
    paddingTop: 14,
  },
  footnoteLabel: {
    color: '#51635D',
    fontSize: 11,
    fontWeight: '800',
  },
  footnoteText: {
    color: '#66756F',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 16,
    marginTop: 14,
    paddingVertical: 14,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sourceCard: {
    backgroundColor: '#E8F0EC',
    borderRadius: 20,
    marginTop: 16,
    padding: 17,
  },
  sourceEyebrow: {
    color: '#5D766D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sourceTitle: {
    color: '#25483E',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 7,
  },
  sourceVersion: {
    color: '#6C8079',
    fontSize: 10,
    marginTop: 3,
  },
  sourceText: {
    color: '#5E716A',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  sourceLink: {
    alignItems: 'center',
    borderTopColor: '#D4E0DA',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 12,
  },
  sourceLinkText: {
    color: '#1A594B',
    fontSize: 12,
    fontWeight: '800',
  },
  sourceLinkArrow: {
    color: '#1A594B',
    fontSize: 22,
  },
  disclaimer: {
    color: '#83908C',
    fontSize: 10,
    lineHeight: 16,
    marginHorizontal: 10,
    marginTop: 17,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
