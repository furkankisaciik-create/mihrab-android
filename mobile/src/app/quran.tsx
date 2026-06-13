import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuranProgress } from '@/hooks/use-quran-progress';
import { useQuranSurah } from '@/hooks/use-quran-surah';
import {
  getQuranSurah,
  searchQuranSurahs,
  TOTAL_QURAN_VERSES,
} from '@/services/quran-metadata';
import {
  QURANENC_BISMILLAH,
  QURANENC_BISMILLAH_TRANSLATION,
} from '@/services/quran';
import type { QuranRevelationPlace, QuranSurah, QuranVerse } from '@/types/quran';

type PlaceFilter = 'Tümü' | QuranRevelationPlace;

function formatLastReadDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

async function shareVerse(surah: QuranSurah, verse: QuranVerse) {
  await Share.share({
    title: `MIHRAB - ${surah.name} Suresi`,
    message: `${verse.arabicText}\n\n${verse.translation}\n\n${surah.name} Suresi, ${verse.verseNumber}. Ayet\nMIHRAB`,
  });
}

export default function QuranScreen() {
  const router = useRouter();
  const { state: progress, markLastRead, changeArabicFontSize } = useQuranProgress();
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [requestedVerse, setRequestedVerse] = useState(1);
  const [jumpInput, setJumpInput] = useState('');
  const [query, setQuery] = useState('');
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('Tümü');
  const verseListRef = useRef<FlatList<QuranVerse>>(null);
  const { content, loading, refreshing, error, notice, refresh } =
    useQuranSurah(selectedSurahNumber);

  const filteredSurahs = useMemo(
    () =>
      searchQuranSurahs(query).filter(
        (surah) => placeFilter === 'Tümü' || surah.revelationPlace === placeFilter,
      ),
    [placeFilter, query],
  );

  const openSurah = (surahNumber: number, verseNumber = 1) => {
    const surah = getQuranSurah(surahNumber);
    if (!surah) {
      return;
    }
    const safeVerse = Math.min(surah.verseCount, Math.max(1, verseNumber));
    setRequestedVerse(safeVerse);
    setJumpInput(String(safeVerse));
    setSelectedSurahNumber(surahNumber);
  };

  const jumpToVerse = (verseNumber: number) => {
    if (!content) {
      return;
    }
    const safeVerse = Math.min(content.surah.verseCount, Math.max(1, verseNumber));
    setRequestedVerse(safeVerse);
    setJumpInput(String(safeVerse));
    verseListRef.current?.scrollToIndex({
      animated: true,
      index: safeVerse - 1,
      viewPosition: 0,
    });
  };

  useEffect(() => {
    if (!content || requestedVerse <= 1) {
      return;
    }
    const timer = setTimeout(() => {
      verseListRef.current?.scrollToIndex({
        animated: false,
        index: requestedVerse - 1,
        viewPosition: 0,
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [content, requestedVerse]);

  if (selectedSurahNumber) {
    const selectedSurah = getQuranSurah(selectedSurahNumber);

    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <View style={styles.readerHero}>
          <SafeAreaView edges={['top']} style={styles.readerSafeArea}>
            <View style={styles.readerTop}>
              <Pressable
                accessibilityLabel="Sure listesine dön"
                accessibilityRole="button"
                onPress={() => setSelectedSurahNumber(null)}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>‹ Sureler</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="MIHRAB yol haritasını aç"
                accessibilityRole="button"
                onPress={() => router.push('/explore')}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>Plan</Text>
              </Pressable>
            </View>

            <Text style={styles.readerEyebrow}>
              {selectedSurah?.revelationPlace.toUpperCase()} · {selectedSurah?.verseCount} AYET
            </Text>
            <Text style={styles.readerTitle}>{selectedSurah?.name} Suresi</Text>

            <View style={styles.readerTools}>
              <View style={styles.jumpControl}>
                <TextInput
                  accessibilityLabel="Ayet numarası"
                  inputMode="numeric"
                  keyboardType="number-pad"
                  onChangeText={(value) => setJumpInput(value.replace(/[^\d]/g, ''))}
                  onSubmitEditing={() => jumpToVerse(Number(jumpInput) || 1)}
                  placeholder="Ayet"
                  placeholderTextColor="#9EB5AC"
                  style={styles.jumpInput}
                  value={jumpInput}
                />
                <Pressable
                  accessibilityLabel="Ayet numarasına git"
                  accessibilityRole="button"
                  onPress={() => jumpToVerse(Number(jumpInput) || 1)}
                  style={styles.jumpButton}>
                  <Text style={styles.jumpButtonText}>Git</Text>
                </Pressable>
              </View>
              <View style={styles.fontControls}>
                <Pressable
                  accessibilityLabel="Arapça yazıyı küçült"
                  accessibilityRole="button"
                  onPress={() => changeArabicFontSize(progress.arabicFontSize - 2)}
                  style={styles.fontButton}>
                  <Text style={styles.fontButtonText}>A−</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Arapça yazıyı büyüt"
                  accessibilityRole="button"
                  onPress={() => changeArabicFontSize(progress.arabicFontSize + 2)}
                  style={styles.fontButton}>
                  <Text style={styles.fontButtonText}>A+</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {loading && !content ? (
          <View style={styles.loadingScreen}>
            <ActivityIndicator color="#1A594B" size="large" />
            <Text style={styles.loadingText}>{selectedSurah?.name} Suresi hazırlanıyor</Text>
          </View>
        ) : error && !content ? (
          <View style={styles.errorScreen}>
            <Text style={styles.errorTitle}>Sure açılamadı</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tekrar dene</Text>
            </Pressable>
          </View>
        ) : content ? (
          <FlatList
            ref={verseListRef}
            contentContainerStyle={styles.verseList}
            data={content.verses}
            keyExtractor={(verse) => String(verse.verseNumber)}
            onScrollToIndexFailed={({ index, averageItemLength }) => {
              verseListRef.current?.scrollToOffset({
                animated: false,
                offset: Math.max(0, index * averageItemLength),
              });
              setTimeout(() => {
                verseListRef.current?.scrollToIndex({
                  animated: true,
                  index,
                  viewPosition: 0,
                });
              }, 200);
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#1A594B" />
            }
            ListHeaderComponent={
              <>
                {notice ? (
                  <View style={styles.noticeCard}>
                    <Text style={styles.noticeText}>{notice}</Text>
                  </View>
                ) : null}
                {content.surah.number !== 1 && content.surah.number !== 9 ? (
                  <View style={styles.bismillahCard}>
                    <Text accessibilityLanguage="ar" style={styles.bismillah}>
                      {QURANENC_BISMILLAH}
                    </Text>
                    <Text style={styles.bismillahMeaning}>
                      {QURANENC_BISMILLAH_TRANSLATION}
                    </Text>
                  </View>
                ) : null}
              </>
            }
            renderItem={({ item }) => {
              const bookmarked =
                progress.lastRead?.surahNumber === content.surah.number &&
                progress.lastRead.verseNumber === item.verseNumber;
              return (
                <View
                  style={[
                    styles.verseCard,
                    bookmarked && styles.verseCardBookmarked,
                  ]}>
                  <View style={styles.verseHeader}>
                    <View style={styles.verseNumber}>
                      <Text style={styles.verseNumberText}>{item.verseNumber}</Text>
                    </View>
                    {bookmarked ? (
                      <View style={styles.bookmarkBadge}>
                        <Text style={styles.bookmarkBadgeText}>KALDIĞIM YER</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text
                    accessibilityLanguage="ar"
                    selectable
                    style={[
                      styles.arabicText,
                      {
                        fontSize: progress.arabicFontSize,
                        lineHeight: progress.arabicFontSize * 1.75,
                      },
                    ]}>
                    {item.arabicText}
                  </Text>

                  <View style={styles.translationSection}>
                    <Text style={styles.translationLabel}>TÜRKÇE ANLAMI</Text>
                    <Text selectable style={styles.translationText}>
                      {item.translation}
                    </Text>
                    {item.footnotes ? (
                      <View style={styles.footnoteCard}>
                        <Text style={styles.footnoteLabel}>Açıklama</Text>
                        <Text selectable style={styles.footnoteText}>
                          {item.footnotes}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.verseActions}>
                    <Pressable
                      accessibilityLabel={`${content.surah.name} ${item.verseNumber}. ayette kaldım`}
                      accessibilityRole="button"
                      onPress={() =>
                        markLastRead(content.surah.number, item.verseNumber)
                      }
                      style={[
                        styles.bookmarkButton,
                        bookmarked && styles.bookmarkButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.bookmarkButtonText,
                          bookmarked && styles.bookmarkButtonTextActive,
                        ]}>
                        {bookmarked ? 'Kaldığın yer' : 'Burada kaldım'}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`${content.surah.name} ${item.verseNumber}. ayeti paylaş`}
                      accessibilityRole="button"
                      onPress={() => shareVerse(content.surah, item)}
                      style={styles.shareButton}>
                      <Text style={styles.shareButtonText}>Paylaş</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              <View style={styles.readerFooter}>
                <View style={styles.surahNavigation}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={content.surah.number === 1}
                    onPress={() => openSurah(content.surah.number - 1)}
                    style={[
                      styles.navigationButton,
                      content.surah.number === 1 && styles.navigationButtonDisabled,
                    ]}>
                    <Text style={styles.navigationButtonText}>‹ Önceki sure</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={content.surah.number === 114}
                    onPress={() => openSurah(content.surah.number + 1)}
                    style={[
                      styles.navigationButton,
                      content.surah.number === 114 && styles.navigationButtonDisabled,
                    ]}>
                    <Text style={styles.navigationButtonText}>Sonraki sure ›</Text>
                  </Pressable>
                </View>
                <View style={styles.sourceCard}>
                  <Text style={styles.sourceEyebrow}>KAYNAK VE SÜRÜM</Text>
                  <Text style={styles.sourceTitle}>{content.translationTitle}</Text>
                  <Text style={styles.sourceText}>
                    Sürüm {content.translationVersion}. Arapça metin ve Türkçe meal
                    Kur’an Mealleri Ansiklopedisi’nden değiştirilmeden gösterilir.
                  </Text>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => Linking.openURL(content.sourceUrl)}
                    style={styles.sourceLink}>
                    <Text style={styles.sourceLinkText}>Kaynakta aç</Text>
                  </Pressable>
                </View>
              </View>
            }
          />
        ) : null}
      </View>
    );
  }

  const lastReadSurah = progress.lastRead
    ? getQuranSurah(progress.lastRead.surahNumber)
    : null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.catalogContent} showsVerticalScrollIndicator={false}>
        <View style={styles.catalogHero}>
          <SafeAreaView edges={['top']} style={styles.catalogSafeArea}>
            <View style={styles.readerTop}>
              <Pressable
                accessibilityLabel="Dua kütüphanesini aç"
                accessibilityRole="button"
                onPress={() => router.push('/duas')}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>Dua kütüphanesi</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="MIHRAB yol haritasını aç"
                accessibilityRole="button"
                onPress={() => router.push('/explore')}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>Plan</Text>
              </Pressable>
            </View>
            <Text style={styles.readerEyebrow}>MIHRAB · KUR’AN-I KERİM</Text>
            <Text style={styles.catalogTitle}>Oku, anla, kaldığın yerden devam et</Text>
            <Text style={styles.catalogSubtitle}>
              Arapça metin ve kaynaklı Türkçe meal, açılan sureler için çevrimdışı önbellek.
            </Text>
            <View style={styles.catalogStats}>
              <View style={styles.catalogStat}>
                <Text style={styles.catalogStatValue}>114</Text>
                <Text style={styles.catalogStatLabel}>sure</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.catalogStat}>
                <Text style={styles.catalogStatValue}>{TOTAL_QURAN_VERSES}</Text>
                <Text style={styles.catalogStatLabel}>ayet</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.catalogStat}>
                <Text style={styles.catalogStatValue}>TR</Text>
                <Text style={styles.catalogStatLabel}>kaynaklı meal</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.catalogBody}>
          {lastReadSurah && progress.lastRead ? (
            <Pressable
              accessibilityLabel={`${lastReadSurah.name} Suresi ${progress.lastRead.verseNumber}. ayetten devam et`}
              accessibilityRole="button"
              onPress={() =>
                openSurah(lastReadSurah.number, progress.lastRead?.verseNumber)
              }
              style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
              <View style={styles.continueIcon}>
                <Text style={styles.continueIconText}>۞</Text>
              </View>
              <View style={styles.continueCopy}>
                <Text style={styles.continueEyebrow}>KALDIĞIN YERDEN DEVAM ET</Text>
                <Text style={styles.continueTitle}>
                  {lastReadSurah.name} Suresi · {progress.lastRead.verseNumber}. Ayet
                </Text>
                <Text style={styles.continueDate}>
                  {formatLastReadDate(progress.lastRead.updatedAt)}
                </Text>
              </View>
              <Text style={styles.continueArrow}>›</Text>
            </Pressable>
          ) : (
            <View style={styles.startCard}>
              <Text style={styles.startTitle}>Okuma yolculuğun burada başlıyor</Text>
              <Text style={styles.startText}>
                Bir ayette “Burada kaldım” dediğinde MIHRAB sonraki gelişinde seni oraya götürür.
              </Text>
            </View>
          )}

          <View style={styles.searchCard}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              accessibilityLabel="Sure ara"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Sure adı veya numarası ara"
              placeholderTextColor="#86938E"
              returnKeyType="search"
              style={styles.searchInput}
              value={query}
            />
          </View>

          <View style={styles.placeFilters}>
            {(['Tümü', 'Mekke', 'Medine'] as const).map((place) => (
              <Pressable
                key={place}
                accessibilityRole="button"
                onPress={() => setPlaceFilter(place)}
                style={[
                  styles.placeFilter,
                  placeFilter === place && styles.placeFilterActive,
                ]}>
                <Text
                  style={[
                    styles.placeFilterText,
                    placeFilter === place && styles.placeFilterTextActive,
                  ]}>
                  {place}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.catalogHeading}>
            <View>
              <Text style={styles.sectionEyebrow}>SURELER</Text>
              <Text style={styles.sectionTitle}>Kur’an fihristi</Text>
            </View>
            <Text style={styles.resultCount}>{filteredSurahs.length} sure</Text>
          </View>

          <View style={styles.surahList}>
            {filteredSurahs.map((surah) => {
              const isLastRead = progress.lastRead?.surahNumber === surah.number;
              return (
                <Pressable
                  key={surah.number}
                  accessibilityLabel={`${surah.name} Suresini aç`}
                  accessibilityRole="button"
                  onPress={() =>
                    openSurah(
                      surah.number,
                      isLastRead ? progress.lastRead?.verseNumber : 1,
                    )
                  }
                  style={({ pressed }) => [
                    styles.surahRow,
                    isLastRead && styles.surahRowLastRead,
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.surahNumber}>
                    <Text style={styles.surahNumberText}>{surah.number}</Text>
                  </View>
                  <View style={styles.surahCopy}>
                    <View style={styles.surahTitleRow}>
                      <Text style={styles.surahName}>{surah.name}</Text>
                      {isLastRead ? (
                        <View style={styles.lastReadBadge}>
                          <Text style={styles.lastReadBadgeText}>KALDIĞIN YER</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.surahMeta}>
                      {surah.revelationPlace} · {surah.verseCount} ayet
                    </Text>
                  </View>
                  <Text style={styles.surahArrow}>›</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.catalogSource}>
            <Text style={styles.infoTitle}>Metin ve meal kaynağı</Text>
            <Text style={styles.infoText}>
              Sureler açıldığında Arapça metin ve Türkçe meal Kur’an Mealleri Ansiklopedisi
              API’sinden alınır. Başarıyla açılan son sekiz sure çevrimdışı kullanım için bu
              cihazda saklanır.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F3F6F2', flex: 1 },
  catalogContent: { paddingBottom: 125 },
  catalogHero: {
    backgroundColor: '#123E36',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  catalogSafeArea: { paddingBottom: 27, paddingHorizontal: 22, paddingTop: 10 },
  readerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroLink: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroLinkText: { color: '#D7E6E0', fontSize: 10, fontWeight: '800' },
  readerEyebrow: {
    color: '#A7C7BB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  catalogTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 6,
  },
  catalogSubtitle: {
    color: '#BDD0C9',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  catalogStats: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 19,
    flexDirection: 'row',
    marginTop: 22,
    paddingVertical: 14,
  },
  catalogStat: { alignItems: 'center', flex: 1 },
  catalogStatValue: { color: '#F1CF82', fontSize: 18, fontWeight: '900' },
  catalogStatLabel: { color: '#AFC7BE', fontSize: 9, marginTop: 3 },
  heroDivider: { backgroundColor: 'rgba(255,255,255,0.14)', height: 28, width: 1 },
  catalogBody: { paddingHorizontal: 20, paddingTop: 18 },
  continueCard: {
    alignItems: 'center',
    backgroundColor: '#FFF1CF',
    borderColor: '#E6CA86',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  continueIcon: {
    alignItems: 'center',
    backgroundColor: '#174D42',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  continueIconText: { color: '#F1CF82', fontSize: 22 },
  continueCopy: { flex: 1 },
  continueEyebrow: {
    color: '#8A6825',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  continueTitle: { color: '#3B382D', fontSize: 15, fontWeight: '800', marginTop: 4 },
  continueDate: { color: '#887A5B', fontSize: 9, marginTop: 3 },
  continueArrow: { color: '#8B713B', fontSize: 27 },
  startCard: {
    backgroundColor: '#E8F1EC',
    borderRadius: 19,
    padding: 16,
  },
  startTitle: { color: '#23473D', fontSize: 14, fontWeight: '900' },
  startText: { color: '#667970', fontSize: 10, lineHeight: 16, marginTop: 5 },
  searchCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DFE8E3',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 14,
    paddingHorizontal: 14,
  },
  searchIcon: { color: '#1A594B', fontSize: 24, marginRight: 8 },
  searchInput: { color: '#24362F', flex: 1, fontSize: 14, minHeight: 52 },
  placeFilters: { flexDirection: 'row', gap: 8, marginTop: 12 },
  placeFilter: {
    backgroundColor: '#E5EDE9',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  placeFilterActive: { backgroundColor: '#1A594B' },
  placeFilterText: { color: '#64756E', fontSize: 10, fontWeight: '800' },
  placeFilterTextActive: { color: '#FFFFFF' },
  catalogHeading: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
    marginTop: 21,
  },
  sectionEyebrow: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionTitle: { color: '#1E302A', fontSize: 21, fontWeight: '800', marginTop: 3 },
  resultCount: { color: '#788780', fontSize: 11, marginBottom: 3 },
  surahList: { gap: 9 },
  surahRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E9E5',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 13,
  },
  surahRowLastRead: { borderColor: '#D9BC77', backgroundColor: '#FFFBF1' },
  pressed: { opacity: 0.76 },
  surahNumber: {
    alignItems: 'center',
    backgroundColor: '#E5F0EB',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  surahNumberText: { color: '#1A594B', fontSize: 11, fontWeight: '900' },
  surahCopy: { flex: 1 },
  surahTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  surahName: { color: '#263A33', fontSize: 15, fontWeight: '800' },
  surahMeta: { color: '#7A8883', fontSize: 9, marginTop: 3 },
  lastReadBadge: { backgroundColor: '#F4E3B8', borderRadius: 8, padding: 4 },
  lastReadBadgeText: { color: '#7C5E21', fontSize: 6, fontWeight: '900' },
  surahArrow: { color: '#71837B', fontSize: 25 },
  catalogSource: {
    backgroundColor: '#E8F0EC',
    borderRadius: 18,
    marginTop: 18,
    padding: 16,
  },
  infoTitle: { color: '#23473D', fontSize: 12, fontWeight: '900' },
  infoText: { color: '#65776F', fontSize: 10, lineHeight: 16, marginTop: 5 },
  readerHero: {
    backgroundColor: '#123E36',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  readerSafeArea: { paddingBottom: 19, paddingHorizontal: 20, paddingTop: 9 },
  readerTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '800', marginTop: 4 },
  readerTools: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
  },
  jumpControl: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 13,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  jumpInput: {
    color: '#FFFFFF',
    fontSize: 11,
    minHeight: 36,
    paddingHorizontal: 11,
    width: 68,
  },
  jumpButton: {
    alignItems: 'center',
    backgroundColor: '#F1CF82',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  jumpButtonText: { color: '#4D3B15', fontSize: 10, fontWeight: '900' },
  fontControls: { flexDirection: 'row', gap: 7 },
  fontButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 39,
  },
  fontButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  loadingScreen: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#60716B', fontSize: 12, marginTop: 12 },
  errorScreen: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  errorTitle: { color: '#263A33', fontSize: 19, fontWeight: '900' },
  errorText: { color: '#74827D', fontSize: 12, marginTop: 7, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#1A594B',
    borderRadius: 13,
    marginTop: 16,
    paddingHorizontal: 17,
    paddingVertical: 11,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  verseList: { paddingBottom: 125, paddingHorizontal: 16, paddingTop: 15 },
  noticeCard: { backgroundColor: '#FFF4D7', borderRadius: 14, marginBottom: 12, padding: 12 },
  noticeText: { color: '#725D2D', fontSize: 10, lineHeight: 15 },
  bismillahCard: { alignItems: 'center', paddingBottom: 18, paddingTop: 6 },
  bismillah: { color: '#174D42', fontSize: 25, lineHeight: 42 },
  bismillahMeaning: { color: '#788780', fontSize: 9, marginTop: 2 },
  verseCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E9E5',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 13,
    padding: 17,
  },
  verseCardBookmarked: { borderColor: '#D3AE58', backgroundColor: '#FFFCF5' },
  verseHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  verseNumber: {
    alignItems: 'center',
    backgroundColor: '#E5F0EB',
    borderRadius: 13,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  verseNumberText: { color: '#1A594B', fontSize: 10, fontWeight: '900' },
  bookmarkBadge: { backgroundColor: '#F1DDA8', borderRadius: 9, padding: 6 },
  bookmarkBadgeText: { color: '#765A20', fontSize: 7, fontWeight: '900' },
  arabicText: {
    color: '#173D34',
    marginTop: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translationSection: {
    borderTopColor: '#E7EDEA',
    borderTopWidth: 1,
    marginTop: 15,
    paddingTop: 14,
  },
  translationLabel: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  translationText: { color: '#31443B', fontSize: 14, lineHeight: 22, marginTop: 6 },
  footnoteCard: { backgroundColor: '#F3F5F4', borderRadius: 13, marginTop: 12, padding: 12 },
  footnoteLabel: { color: '#566A62', fontSize: 9, fontWeight: '900' },
  footnoteText: { color: '#718079', fontSize: 10, lineHeight: 16, marginTop: 4 },
  verseActions: { flexDirection: 'row', gap: 9, marginTop: 14 },
  bookmarkButton: {
    alignItems: 'center',
    backgroundColor: '#E7F0EB',
    borderRadius: 13,
    flex: 1,
    paddingVertical: 11,
  },
  bookmarkButtonActive: { backgroundColor: '#174D42' },
  bookmarkButtonText: { color: '#1A594B', fontSize: 10, fontWeight: '900' },
  bookmarkButtonTextActive: { color: '#FFFFFF' },
  shareButton: {
    alignItems: 'center',
    backgroundColor: '#FFF2D5',
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  shareButtonText: { color: '#795D24', fontSize: 10, fontWeight: '900' },
  readerFooter: { paddingTop: 6 },
  surahNavigation: { flexDirection: 'row', gap: 10 },
  navigationButton: {
    alignItems: 'center',
    backgroundColor: '#174D42',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 12,
  },
  navigationButtonDisabled: { opacity: 0.35 },
  navigationButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  sourceCard: { backgroundColor: '#E8F0EC', borderRadius: 18, marginTop: 14, padding: 16 },
  sourceEyebrow: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sourceTitle: { color: '#263A33', fontSize: 13, fontWeight: '900', marginTop: 5 },
  sourceText: { color: '#65776F', fontSize: 10, lineHeight: 16, marginTop: 5 },
  sourceLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D8E7DF',
    borderRadius: 11,
    marginTop: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sourceLinkText: { color: '#1A594B', fontSize: 9, fontWeight: '900' },
});
