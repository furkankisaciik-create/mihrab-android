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

import { DailyContentSwitcher } from '@/components/daily-content-switcher';
import { useDailyHadith } from '@/hooks/use-daily-hadith';
import { formatDailyContentDate } from '@/services/daily-content-date';
import type { HadithSource } from '@/types/hadith';

function formatSource(source: HadithSource) {
  return `${source.book}, hadis no. ${source.hadithNumbers.join(', ')}`;
}

export function DailyHadithView() {
  const { hadith, dateKey, loading, refreshing, error, notice, refresh } = useDailyHadith();

  const shareHadith = async () => {
    if (!hadith) {
      return;
    }

    await Share.share({
      message: `${hadith.text}\n\n${hadith.grade} · ${hadith.attribution}\n${hadith.sources.map(formatSource).join('; ')}\n${hadith.sourceUrl}`,
      title: 'MIHRAB - Günün Hadisi',
    });
  };

  const statusLabel = hadith?.isFallback
    ? 'Çevrimdışı'
    : hadith?.isCached
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
                <Text style={styles.title}>Günün hadisi</Text>
              </View>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    hadith?.isFallback && styles.statusDotFallback,
                    hadith?.isCached && styles.statusDotCached,
                  ]}
                />
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={styles.date}>{formatDailyContentDate(dateKey)}</Text>
            <Text style={styles.renewal}>Her gün Türkiye saatiyle 00.00’da yenilenir</Text>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <DailyContentSwitcher selected="hadith" />

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

          {loading && !hadith ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#1A594B" size="large" />
              <Text style={styles.loadingText}>Bugünün hadisi hazırlanıyor</Text>
            </View>
          ) : hadith ? (
            <>
              <View style={styles.headingCard}>
                <Text style={styles.headingEyebrow}>HADİS NO. {hadith.id}</Text>
                <Text style={styles.hadithTitle}>{hadith.title}</Text>
                <View style={styles.metadataRow}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{hadith.grade}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.attribution}>
                    {hadith.attribution}
                  </Text>
                </View>
              </View>

              <View style={styles.arabicCard}>
                <Text accessibilityLanguage="ar" selectable style={styles.arabicText}>
                  {hadith.arabicText}
                </Text>
              </View>

              <View style={styles.translationCard}>
                <Text style={styles.cardLabel}>TÜRKÇE HADİS METNİ</Text>
                <Text selectable style={styles.translationText}>
                  {hadith.text}
                </Text>
              </View>

              <View style={styles.explanationCard}>
                <Text style={styles.cardLabel}>KISA AÇIKLAMA</Text>
                <Text selectable style={styles.explanationText}>
                  {hadith.explanation}
                </Text>

                {hadith.lessons.length ? (
                  <View style={styles.lessons}>
                    <Text style={styles.lessonsTitle}>Öne çıkan dersler</Text>
                    {hadith.lessons.slice(0, 4).map((lesson) => (
                      <View key={lesson} style={styles.lessonRow}>
                        <View style={styles.lessonDot} />
                        <Text style={styles.lessonText}>{lesson}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={shareHadith}
                style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
                <Text style={styles.shareButtonText}>Hadisi paylaş</Text>
              </Pressable>

              <View style={styles.sourceCard}>
                <Text style={styles.sourceEyebrow}>KAYNAK VE TAHRİÇ</Text>
                <Text style={styles.sourceTitle}>{hadith.sourceName}</Text>
                <Text style={styles.sourceVersion}>Türkçe veri sürümü {hadith.sourceVersion}</Text>

                <View style={styles.sourceList}>
                  {hadith.sources.map((source) => (
                    <View key={`${source.book}-${source.hadithNumbers.join('-')}`} style={styles.sourceRow}>
                      <View style={styles.sourceDot} />
                      <Text style={styles.sourceCitation}>{formatSource(source)}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sourceText}>
                  Metin, tercüme, sıhhat derecesi ve tahriç bilgisi kaynak API’den içerik
                  değiştirilmeden gösterilir.
                </Text>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(hadith.sourceUrl)}
                  style={({ pressed }) => [styles.sourceLink, pressed && styles.pressed]}>
                  <Text style={styles.sourceLinkText}>Kaynakta aç</Text>
                  <Text style={styles.sourceLinkArrow}>›</Text>
                </Pressable>
              </View>

              <Text style={styles.disclaimer}>
                Hadis metni, sıhhat derecesi ve açıklaması kaynak kurumun ilmî çalışmasına
                dayanır. Fıkhî hüküm gerektiren konularda ehil bir uzmana danışılması tavsiye
                edilir.
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
    justifyContent: 'center',
    minHeight: 220,
  },
  loadingText: {
    color: '#60716B',
    fontSize: 12,
    marginTop: 13,
  },
  headingCard: {
    marginBottom: 15,
  },
  headingEyebrow: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  hadithTitle: {
    color: '#1D2D28',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginTop: 6,
  },
  metadataRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 11,
  },
  gradeBadge: {
    backgroundColor: '#DCEBE4',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  gradeText: {
    color: '#1A594B',
    fontSize: 10,
    fontWeight: '900',
  },
  attribution: {
    color: '#6D7B76',
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    marginLeft: 10,
  },
  arabicCard: {
    backgroundColor: '#174D42',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  arabicText: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 45,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 15,
    padding: 19,
  },
  cardLabel: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  translationText: {
    color: '#2A3934',
    fontSize: 16,
    lineHeight: 26,
    marginTop: 12,
  },
  explanationCard: {
    backgroundColor: '#FFF5DE',
    borderRadius: 22,
    marginTop: 15,
    padding: 19,
  },
  explanationText: {
    color: '#514B3D',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 11,
  },
  lessons: {
    borderTopColor: '#E8DDBE',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
    paddingTop: 14,
  },
  lessonsTitle: {
    color: '#655631',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 9,
  },
  lessonRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 7,
  },
  lessonDot: {
    backgroundColor: '#A47B29',
    borderRadius: 3,
    height: 6,
    marginRight: 9,
    marginTop: 7,
    width: 6,
  },
  lessonText: {
    color: '#625A47',
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
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
  sourceList: {
    gap: 7,
    marginTop: 13,
  },
  sourceRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  sourceDot: {
    backgroundColor: '#1A594B',
    borderRadius: 3,
    height: 6,
    marginRight: 8,
    marginTop: 5,
    width: 6,
  },
  sourceCitation: {
    color: '#3F5C53',
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  sourceText: {
    color: '#5E716A',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
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
