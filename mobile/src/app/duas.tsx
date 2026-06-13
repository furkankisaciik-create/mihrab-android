import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDuaFavorites } from '@/hooks/use-dua-favorites';
import {
  DUA_CATEGORIES,
  DUAS,
  getDuaCategoryLabel,
  searchDuas,
} from '@/services/dua-library';
import type { Dua, DuaCategoryKey } from '@/types/dua';

type CategoryFilter = 'all' | DuaCategoryKey;
type LibraryView = 'all' | 'favorites';

async function shareDua(dua: Dua) {
  await Share.share({
    message: `${dua.title}\n\n${dua.arabicText}\n\nOkunuşu:\n${dua.transliteration}\n\nAnlamı:\n${dua.meaning}\n\n${dua.source}\nMIHRAB`,
    title: `MIHRAB - ${dua.title}`,
  });
}

export default function DuaLibraryScreen() {
  const router = useRouter();
  const {
    state: favoritesState,
    loading: favoritesLoading,
    count: favoriteCount,
    isFavorite,
    toggleFavorite,
  } = useDuaFavorites();
  const [query, setQuery] = useState('');
  const [selectedView, setSelectedView] = useState<LibraryView>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([DUAS[0]?.id].filter(Boolean)),
  );
  const filteredDuas = useMemo(
    () => {
      const matches = searchDuas(
        query,
        selectedCategory === 'all' ? undefined : selectedCategory,
      );
      if (selectedView === 'favorites') {
        return matches.filter((dua) => favoritesState.ids.includes(dua.id));
      }
      return matches;
    },
    [favoritesState.ids, query, selectedCategory, selectedView],
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <View style={styles.heroTop}>
              <Pressable
                accessibilityLabel="Günlük içerik ekranına dön"
                accessibilityRole="button"
                onPress={() => router.push('/verse')}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>Günlük içerik</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="MIHRAB yol haritasını aç"
                accessibilityRole="button"
                onPress={() => router.push('/explore')}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>Plan</Text>
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · İÇERİK VE İBADET</Text>
            <Text style={styles.title}>Dua kütüphanesi</Text>
            <Text style={styles.subtitle}>
              Kur’an-ı Kerim’de geçen duaları Arapça metni, okunuşu ve anlamıyla keşfedin.
            </Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{DUAS.length}</Text>
                <Text style={styles.heroStatLabel}>kaynaklı dua</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{DUA_CATEGORIES.length}</Text>
                <Text style={styles.heroStatLabel}>kategori</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>
                  {favoritesLoading ? '—' : favoriteCount}
                </Text>
                <Text style={styles.heroStatLabel}>favori</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.searchCard}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              accessibilityLabel="Dua ara"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={setQuery}
              placeholder="Dua, konu veya sure ara"
              placeholderTextColor="#86938E"
              returnKeyType="search"
              style={styles.searchInput}
              value={query}
            />
            {query.length > 0 && (
              <Pressable
                accessibilityLabel="Aramayı temizle"
                accessibilityRole="button"
                onPress={() => setQuery('')}
                style={styles.clearButton}>
                <Text style={styles.clearButtonText}>×</Text>
              </Pressable>
            )}
          </View>

          <View accessibilityRole="tablist" style={styles.libraryViews}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedView === 'all' }}
              onPress={() => setSelectedView('all')}
              style={[
                styles.libraryViewButton,
                selectedView === 'all' && styles.libraryViewButtonActive,
              ]}>
              <Text
                style={[
                  styles.libraryViewText,
                  selectedView === 'all' && styles.libraryViewTextActive,
                ]}>
                Tüm dualar
              </Text>
              <View
                style={[
                  styles.libraryViewCount,
                  selectedView === 'all' && styles.libraryViewCountActive,
                ]}>
                <Text
                  style={[
                    styles.libraryViewCountText,
                    selectedView === 'all' && styles.libraryViewCountTextActive,
                  ]}>
                  {DUAS.length}
                </Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedView === 'favorites' }}
              onPress={() => setSelectedView('favorites')}
              style={[
                styles.libraryViewButton,
                selectedView === 'favorites' && styles.libraryViewButtonActive,
              ]}>
              <Text
                style={[
                  styles.libraryViewText,
                  selectedView === 'favorites' && styles.libraryViewTextActive,
                ]}>
                Favorilerim
              </Text>
              <View
                style={[
                  styles.libraryViewCount,
                  selectedView === 'favorites' && styles.libraryViewCountActive,
                ]}>
                <Text
                  style={[
                    styles.libraryViewCountText,
                    selectedView === 'favorites' && styles.libraryViewCountTextActive,
                  ]}>
                  {favoriteCount}
                </Text>
              </View>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.categories}
            horizontal
            showsHorizontalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedCategory('all')}
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && styles.categoryChipActive,
              ]}>
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'all' && styles.categoryChipTextActive,
                ]}>
                Tümü
              </Text>
            </Pressable>
            {DUA_CATEGORIES.map((category) => (
              <Pressable
                key={category.key}
                accessibilityRole="button"
                onPress={() => setSelectedCategory(category.key)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.key && styles.categoryChipActive,
                ]}>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.key && styles.categoryChipTextActive,
                  ]}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>KÜTÜPHANE</Text>
              <Text style={styles.sectionTitle}>
                {selectedView === 'favorites'
                  ? 'Favori dualarım'
                  : selectedCategory === 'all'
                  ? 'Bütün dualar'
                  : getDuaCategoryLabel(selectedCategory)}
              </Text>
            </View>
            <Text style={styles.resultCount}>{filteredDuas.length} dua</Text>
          </View>

          {filteredDuas.length > 0 ? (
            <View style={styles.duaList}>
              {filteredDuas.map((dua, index) => {
                const expanded = expandedIds.has(dua.id);
                const favorite = isFavorite(dua.id);
                return (
                  <View
                    key={dua.id}
                    style={[styles.duaCard, favorite && styles.duaCardFavorite]}>
                    <View style={styles.duaHeader}>
                      <Pressable
                        accessibilityLabel={`${dua.title} duasını ${expanded ? 'daralt' : 'aç'}`}
                        accessibilityRole="button"
                        onPress={() => toggleExpanded(dua.id)}
                        style={({ pressed }) => [
                          styles.duaHeaderMain,
                          pressed && styles.pressed,
                        ]}>
                        <View style={styles.duaNumber}>
                          <Text style={styles.duaNumberText}>
                            {String(index + 1).padStart(2, '0')}
                          </Text>
                        </View>
                        <View style={styles.duaHeaderCopy}>
                          <Text style={styles.duaCategory}>
                            {getDuaCategoryLabel(dua.category)}
                          </Text>
                          <Text style={styles.duaTitle}>{dua.title}</Text>
                          <Text numberOfLines={expanded ? undefined : 2} style={styles.duaSummary}>
                            {dua.summary}
                          </Text>
                        </View>
                      </Pressable>

                      <View style={styles.cardActions}>
                        <Pressable
                          accessibilityLabel={`${dua.title} duasını ${
                            favorite ? 'favorilerden çıkar' : 'favorilere ekle'
                          }`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: favorite }}
                          onPress={() => toggleFavorite(dua.id)}
                          style={[
                            styles.favoriteButton,
                            favorite && styles.favoriteButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.favoriteButtonText,
                              favorite && styles.favoriteButtonTextActive,
                            ]}>
                            {favorite ? '♥' : '♡'}
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityLabel={`${dua.title} duasını ${
                            expanded ? 'daralt' : 'aç'
                          }`}
                          accessibilityRole="button"
                          onPress={() => toggleExpanded(dua.id)}
                          style={[
                            styles.expandButton,
                            expanded && styles.expandButtonActive,
                          ]}>
                          <Text
                            style={[
                              styles.expandButtonText,
                              expanded && styles.expandButtonTextActive,
                            ]}>
                            {expanded ? '−' : '+'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {expanded && (
                      <View style={styles.duaBody}>
                        <View style={styles.arabicCard}>
                          <Text
                            accessibilityLanguage="ar"
                            selectable
                            style={styles.arabicText}>
                            {dua.arabicText}
                          </Text>
                        </View>

                        <View style={styles.textSection}>
                          <Text style={styles.textSectionLabel}>OKUNUŞU</Text>
                          <Text selectable style={styles.transliteration}>
                            {dua.transliteration}
                          </Text>
                        </View>

                        <View style={styles.textSection}>
                          <Text style={styles.textSectionLabel}>TÜRKÇE ANLAMI</Text>
                          <Text selectable style={styles.meaning}>
                            {dua.meaning}
                          </Text>
                        </View>

                        <View style={styles.sourceRow}>
                          <View style={styles.sourceCopy}>
                            <Text style={styles.sourceLabel}>KAYNAK</Text>
                            <Text style={styles.sourceText}>{dua.source}</Text>
                          </View>
                          <Pressable
                            accessibilityLabel={`${dua.source} kaynağını aç`}
                            accessibilityRole="link"
                            onPress={() => Linking.openURL(dua.sourceUrl)}
                            style={styles.sourceButton}>
                            <Text style={styles.sourceButtonText}>Kaynakta aç</Text>
                          </Pressable>
                        </View>

                        <Pressable
                          accessibilityLabel={`${dua.title} duasını paylaş`}
                          accessibilityRole="button"
                          onPress={() => shareDua(dua)}
                          style={({ pressed }) => [
                            styles.shareButton,
                            pressed && styles.pressed,
                          ]}>
                          <Text style={styles.shareButtonText}>Duayı paylaş</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyHeart}>{selectedView === 'favorites' ? '♡' : '⌕'}</Text>
              <Text style={styles.emptyTitle}>
                {selectedView === 'favorites' && favoriteCount === 0
                  ? 'Henüz favori dua yok'
                  : 'Dua bulunamadı'}
              </Text>
              <Text style={styles.emptyText}>
                {selectedView === 'favorites' && favoriteCount === 0
                  ? 'Beğendiğiniz duaların kalp düğmesine dokunarak kişisel listenizi oluşturun.'
                  : 'Arama kelimesini veya seçili kategoriyi değiştirin.'}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setQuery('');
                  setSelectedCategory('all');
                  setSelectedView('all');
                }}
                style={styles.resetButton}>
                <Text style={styles.resetButtonText}>
                  {selectedView === 'favorites' ? 'Tüm duaları göster' : 'Filtreleri temizle'}
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Kaynak yaklaşımı</Text>
            <Text style={styles.infoText}>
              Bu ilk sürüm yalnızca Kur’an-ı Kerim’de geçen dualardan oluşur. Arapça metin ve
              Türkçe anlamlar Kur’an Mealleri Ansiklopedisi kaynağıyla eşleştirilmiştir.
              Okunuşlar yardımcı bir Latin harf aktarımıdır; Arapça aslının yerini tutmaz.
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingBottom: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  heroTop: {
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
  heroLinkText: {
    color: '#D7E6E0',
    fontSize: 10,
    fontWeight: '800',
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
    marginTop: 5,
  },
  subtitle: {
    color: '#BDD0C9',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 430,
  },
  heroStats: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 19,
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatValue: {
    color: '#F1CF82',
    fontSize: 18,
    fontWeight: '900',
  },
  heroStatLabel: {
    color: '#AFC7BE',
    fontSize: 9,
    marginTop: 3,
  },
  heroDivider: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    height: 28,
    width: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  searchCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DFE8E3',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: '#1A594B',
    fontSize: 24,
    marginRight: 8,
  },
  searchInput: {
    color: '#24362F',
    flex: 1,
    fontSize: 14,
    minHeight: 52,
  },
  libraryViews: {
    backgroundColor: '#E3ECE7',
    borderRadius: 17,
    flexDirection: 'row',
    marginTop: 14,
    padding: 4,
  },
  libraryViewButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  libraryViewButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  libraryViewText: {
    color: '#6D7E78',
    fontSize: 11,
    fontWeight: '800',
  },
  libraryViewTextActive: {
    color: '#174D42',
  },
  libraryViewCount: {
    alignItems: 'center',
    backgroundColor: '#D2DED8',
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  libraryViewCountActive: {
    backgroundColor: '#E7F1EC',
  },
  libraryViewCountText: {
    color: '#75847F',
    fontSize: 8,
    fontWeight: '900',
  },
  libraryViewCountTextActive: {
    color: '#1A594B',
  },
  clearButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  clearButtonText: {
    color: '#74837E',
    fontSize: 23,
  },
  categories: {
    gap: 8,
    paddingBottom: 5,
    paddingTop: 14,
  },
  categoryChip: {
    backgroundColor: '#E6EDE9',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  categoryChipActive: {
    backgroundColor: '#1A594B',
  },
  categoryChipText: {
    color: '#62736D',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 19,
  },
  sectionEyebrow: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: '#1E302A',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 3,
  },
  resultCount: {
    color: '#788780',
    fontSize: 11,
    marginBottom: 3,
  },
  duaList: {
    gap: 12,
  },
  duaCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E9E5',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  duaCardFavorite: {
    borderColor: '#D9BC77',
  },
  duaHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: 16,
  },
  duaHeaderMain: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.75,
  },
  duaNumber: {
    alignItems: 'center',
    backgroundColor: '#E4F0EA',
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    width: 38,
  },
  duaNumberText: {
    color: '#1A594B',
    fontSize: 11,
    fontWeight: '900',
  },
  duaHeaderCopy: {
    flex: 1,
    paddingRight: 9,
  },
  cardActions: {
    gap: 7,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: '#FFF4DC',
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  favoriteButtonActive: {
    backgroundColor: '#F0D799',
  },
  favoriteButtonText: {
    color: '#9A762D',
    fontSize: 18,
    lineHeight: 20,
  },
  favoriteButtonTextActive: {
    color: '#785714',
  },
  duaCategory: {
    color: '#9A762D',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  duaTitle: {
    color: '#24362F',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  duaSummary: {
    color: '#72817C',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  expandButton: {
    alignItems: 'center',
    backgroundColor: '#EFF3F1',
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  expandButtonActive: {
    backgroundColor: '#1A594B',
  },
  expandButtonText: {
    color: '#536861',
    fontSize: 19,
    lineHeight: 21,
  },
  expandButtonTextActive: {
    color: '#FFFFFF',
  },
  duaBody: {
    borderTopColor: '#E6ECE9',
    borderTopWidth: 1,
    padding: 16,
    paddingTop: 14,
  },
  arabicCard: {
    backgroundColor: '#174D42',
    borderRadius: 19,
    paddingHorizontal: 17,
    paddingVertical: 20,
  },
  arabicText: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 45,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textSection: {
    borderBottomColor: '#E9EEEB',
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  textSectionLabel: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  transliteration: {
    color: '#46564F',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 21,
    marginTop: 6,
  },
  meaning: {
    color: '#263A33',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  sourceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  sourceCopy: {
    flex: 1,
  },
  sourceLabel: {
    color: '#87948F',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sourceText: {
    color: '#35483F',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  sourceButton: {
    backgroundColor: '#EDF3F0',
    borderRadius: 12,
    marginLeft: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  sourceButtonText: {
    color: '#1A594B',
    fontSize: 9,
    fontWeight: '800',
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: '#FFF2D5',
    borderRadius: 14,
    marginTop: 14,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: '#795D24',
    fontSize: 11,
    fontWeight: '900',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 35,
  },
  emptyTitle: {
    color: '#263A33',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyHeart: {
    color: '#B58C3C',
    fontSize: 36,
    lineHeight: 42,
    marginBottom: 4,
  },
  emptyText: {
    color: '#778680',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#1A594B',
    borderRadius: 13,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#E8F0EC',
    borderRadius: 18,
    marginTop: 18,
    padding: 16,
  },
  infoTitle: {
    color: '#23473D',
    fontSize: 12,
    fontWeight: '900',
  },
  infoText: {
    color: '#65776F',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
});
