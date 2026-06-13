import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { getIstanbulDateKey } from '@/services/daily-content-date';
import {
  formatReligiousCountdown,
  formatReligiousDayDate,
  getDaysUntil,
  getNextReligiousDay,
  getReligiousDaysForYear,
  groupReligiousDays,
  RELIGIOUS_DAY_YEARS,
} from '@/services/religious-days';
import type {
  ReligiousDay,
  ReligiousDayCategory,
} from '@/types/religious-day';

type FilterKey =
  | 'yaklasan'
  | 'tumu'
  | ReligiousDayCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'yaklasan', label: 'Yaklaşanlar' },
  { key: 'tumu', label: 'Tümü' },
  { key: 'kandil', label: 'Kandiller' },
  { key: 'bayram', label: 'Bayramlar' },
  { key: 'baslangic', label: 'Başlangıçlar' },
  { key: 'onemli', label: 'Önemli günler' },
];

function getDefaultYear(todayKey: string) {
  const currentYear = Number(todayKey.slice(0, 4));
  return RELIGIOUS_DAY_YEARS.includes(
    currentYear as (typeof RELIGIOUS_DAY_YEARS)[number],
  )
    ? currentYear
    : RELIGIOUS_DAY_YEARS[0];
}

function dayNumber(dateKey: string) {
  return Number(dateKey.slice(8, 10));
}

function monthShort(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    month: 'short',
  }).format(new Date(`${dateKey}T12:00:00+03:00`));
}

function ReligiousDayCard({
  day,
  todayKey,
  expanded,
  onToggle,
}: {
  day: ReligiousDay;
  todayKey: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const daysUntil = getDaysUntil(day.dateKey, todayKey);
  const upcoming = daysUntil >= 0;

  return (
    <Pressable
      accessibilityLabel={`${day.name} ayrıntılarını ${
        expanded ? 'kapat' : 'aç'
      }`}
      accessibilityRole="button"
      onPress={onToggle}
      style={({ pressed }) => [
        styles.dayCard,
        upcoming && styles.dayCardUpcoming,
        pressed && styles.pressed,
      ]}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateDay}>{dayNumber(day.dateKey)}</Text>
        <Text style={styles.dateMonth}>{monthShort(day.dateKey)}</Text>
      </View>

      <View style={styles.dayCopy}>
        <View style={styles.dayMetaRow}>
          <Text style={styles.category}>{day.categoryLabel}</Text>
          {upcoming ? (
            <Text style={styles.smallCountdown}>
              {formatReligiousCountdown(daysUntil)}
            </Text>
          ) : null}
        </View>
        <Text style={styles.dayTitle}>{day.name}</Text>
        <Text style={styles.dayHijri}>{day.hijriDate}</Text>

        {expanded ? (
          <View style={styles.expandedContent}>
            {day.beginsAtSunset ? (
              <View style={styles.sunsetBadge}>
                <Text style={styles.sunsetText}>
                  Bu mübarek gece akşam ezanıyla başlar
                </Text>
              </View>
            ) : null}
            <Text style={styles.summary}>{day.summary}</Text>
            <Text style={styles.suggestion}>{day.suggestion}</Text>
            <Text style={styles.fullDate}>
              {formatReligiousDayDate(day.dateKey)}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
    </Pressable>
  );
}

export default function HolyDaysScreen() {
  const router = useRouter();
  const todayKey = getIstanbulDateKey();
  const [selectedYear, setSelectedYear] = useState(() =>
    getDefaultYear(todayKey),
  );
  const [filter, setFilter] = useState<FilterKey>('yaklasan');
  const nextDay = getNextReligiousDay(todayKey);
  const [expandedId, setExpandedId] = useState<string | null>(
    nextDay?.id ?? null,
  );

  const filteredDays = useMemo(() => {
    const yearDays = getReligiousDaysForYear(selectedYear);

    if (filter === 'yaklasan') {
      return yearDays.filter((day) => day.dateKey >= todayKey);
    }
    if (filter === 'tumu') {
      return yearDays;
    }
    return yearDays.filter((day) => day.category === filter);
  }, [filter, selectedYear, todayKey]);
  const groupedDays = useMemo(
    () => groupReligiousDays(filteredDays),
    [filteredDays],
  );
  const nextDaysUntil = nextDay
    ? getDaysUntil(nextDay.dateKey, todayKey)
    : null;
  const sourceUrl =
    getReligiousDaysForYear(selectedYear)[0]?.sourceUrl ?? '';

  const selectYear = (year: number) => {
    setSelectedYear(year);
    setFilter(year === Number(todayKey.slice(0, 4)) ? 'yaklasan' : 'tumu');
    setExpandedId(null);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.content}
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
              <Pressable
                accessibilityLabel="Hicri takvimi aç"
                accessibilityRole="button"
                onPress={() => router.push('/calendar')}
                style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Hicri takvim</Text>
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · DİNİ GÜNLER</Text>
            <Text style={styles.heroTitle}>Mübarek zamanları kaçırma</Text>
            <Text style={styles.heroSubtitle}>
              Diyanet’in resmî 2026-2027 listesi, Hicri karşılıklar ve anlaşılır
              günlük hazırlık notları.
            </Text>

            {nextDay && nextDaysUntil !== null ? (
              <View style={styles.nextCard}>
                <View style={styles.nextDate}>
                  <Text style={styles.nextDateDay}>
                    {dayNumber(nextDay.dateKey)}
                  </Text>
                  <Text style={styles.nextDateMonth}>
                    {monthShort(nextDay.dateKey)}
                  </Text>
                </View>
                <View style={styles.nextCopy}>
                  <Text style={styles.nextLabel}>SIRADAKİ DİNİ GÜN</Text>
                  <Text style={styles.nextTitle}>{nextDay.name}</Text>
                  <Text style={styles.nextHijri}>{nextDay.hijriDate}</Text>
                </View>
                <View style={styles.nextCountdown}>
                  <Text style={styles.nextCountdownValue}>
                    {nextDaysUntil}
                  </Text>
                  <Text style={styles.nextCountdownLabel}>
                    {nextDaysUntil === 1 ? 'GÜN' : 'GÜN'}
                  </Text>
                </View>
              </View>
            ) : null}
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.yearSelector}>
            {RELIGIOUS_DAY_YEARS.map((year) => (
              <Pressable
                key={year}
                accessibilityLabel={`${year} dini günlerini göster`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedYear === year }}
                onPress={() => selectYear(year)}
                style={[
                  styles.yearButton,
                  selectedYear === year && styles.yearButtonActive,
                ]}>
                <Text
                  style={[
                    styles.yearText,
                    selectedYear === year && styles.yearTextActive,
                  ]}>
                  {year}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={styles.filters}
            showsHorizontalScrollIndicator={false}>
            {FILTERS.map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === item.key }}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterButton,
                  filter === item.key && styles.filterButtonActive,
                ]}>
                <Text
                  style={[
                    styles.filterText,
                    filter === item.key && styles.filterTextActive,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>RESMÎ TAKVİM</Text>
              <Text style={styles.sectionTitle}>{selectedYear} dini günleri</Text>
            </View>
            <Text style={styles.resultCount}>{filteredDays.length} gün</Text>
          </View>

          {groupedDays.length ? (
            <View style={styles.groups}>
              {groupedDays.map((group) => (
                <View key={group.monthKey}>
                  <Text style={styles.monthLabel}>{group.monthLabel}</Text>
                  <View style={styles.dayList}>
                    {group.days.map((day) => (
                      <ReligiousDayCard
                        key={day.id}
                        day={day}
                        todayKey={todayKey}
                        expanded={expandedId === day.id}
                        onToggle={() =>
                          setExpandedId((current) =>
                            current === day.id ? null : day.id,
                          )
                        }
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Bu filtrede yaklaşan gün yok</Text>
              <Text style={styles.emptyText}>
                “Tümü” filtresinden yılın bütün dini günlerini görebilirsin.
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Gece tarihleri nasıl okunur?</Text>
            <Text style={styles.infoText}>
              Kandil geceleri, Diyanet listesinde yazan Miladi günün akşam
              ezanıyla başlar ve ertesi günün fecrine kadar devam eder.
            </Text>
          </View>

          {sourceUrl ? (
            <Pressable
              accessibilityLabel={`${selectedYear} Diyanet dini günler kaynağını aç`}
              accessibilityRole="link"
              onPress={() => void Linking.openURL(sourceUrl)}
              style={({ pressed }) => [
                styles.sourceButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.sourceButtonText}>
                Diyanet {selectedYear} resmî listesini aç
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.sourceNote}>
            Tarihler Diyanet İşleri Başkanlığının Vakithesaplama biriminde
            yayımlanan yıllık dini günler listesinden alınmıştır. 2028 ve sonrası
            gözleme bağlı çift tarih içerdiği için bu sürümde kesin tarih olarak
            gösterilmez.
          </Text>
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
  content: {
    paddingBottom: 125,
  },
  hero: {
    backgroundColor: '#123E36',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingBottom: 25,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#F1CF82',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 22,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },
  heroSubtitle: {
    color: '#BCD0C8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 340,
  },
  nextCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 20,
    flexDirection: 'row',
    marginTop: 21,
    padding: 13,
  },
  nextDate: {
    alignItems: 'center',
    backgroundColor: '#F1CF82',
    borderRadius: 15,
    height: 53,
    justifyContent: 'center',
    marginRight: 11,
    width: 53,
  },
  nextDateDay: {
    color: '#174D42',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 23,
  },
  nextDateMonth: {
    color: '#42655B',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  nextCopy: {
    flex: 1,
  },
  nextLabel: {
    color: '#A9C6BB',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nextTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  nextHijri: {
    color: '#C5D8D1',
    fontSize: 8,
    marginTop: 3,
  },
  nextCountdown: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    minWidth: 46,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  nextCountdownValue: {
    color: '#F1CF82',
    fontSize: 18,
    fontWeight: '900',
  },
  nextCountdownLabel: {
    color: '#C9DBD4',
    fontSize: 6,
    fontWeight: '900',
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 17,
    paddingTop: 19,
  },
  yearSelector: {
    backgroundColor: '#E4ECE8',
    borderRadius: 17,
    flexDirection: 'row',
    padding: 4,
  },
  yearButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 10,
  },
  yearButtonActive: {
    backgroundColor: '#174D42',
  },
  yearText: {
    color: '#61736C',
    fontSize: 12,
    fontWeight: '900',
  },
  yearTextActive: {
    color: '#FFFFFF',
  },
  filters: {
    gap: 8,
    paddingVertical: 14,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE5E1',
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FFF2D0',
    borderColor: '#E3C875',
  },
  filterText: {
    color: '#66766F',
    fontSize: 9,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#73591F',
  },
  listHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 6,
  },
  sectionEyebrow: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: '#1F302B',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  resultCount: {
    color: '#84918D',
    fontSize: 9,
  },
  groups: {
    gap: 18,
  },
  monthLabel: {
    color: '#53665F',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  dayList: {
    gap: 9,
  },
  dayCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E8E4',
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 13,
  },
  dayCardUpcoming: {
    borderColor: '#C7DCD2',
  },
  pressed: {
    opacity: 0.8,
  },
  dateBlock: {
    alignItems: 'center',
    backgroundColor: '#E8F1EC',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    marginRight: 11,
    width: 48,
  },
  dateDay: {
    color: '#174D42',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  dateMonth: {
    color: '#63776F',
    fontSize: 7,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dayCopy: {
    flex: 1,
  },
  dayMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    color: '#90702D',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  smallCountdown: {
    color: '#1D6555',
    fontSize: 7,
    fontWeight: '900',
  },
  dayTitle: {
    color: '#283A34',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  dayHijri: {
    color: '#7B8984',
    fontSize: 8,
    marginTop: 3,
  },
  expandedContent: {
    borderTopColor: '#E7ECE9',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 11,
    paddingTop: 11,
  },
  sunsetBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1CE',
    borderRadius: 9,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  sunsetText: {
    color: '#806323',
    fontSize: 7,
    fontWeight: '900',
  },
  summary: {
    color: '#4E5E58',
    fontSize: 10,
    lineHeight: 16,
  },
  suggestion: {
    color: '#1A594B',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 7,
  },
  fullDate: {
    color: '#89948F',
    fontSize: 8,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  expandIcon: {
    color: '#74867F',
    fontSize: 18,
    marginLeft: 8,
    marginTop: 12,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
  },
  emptyTitle: {
    color: '#263A33',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    color: '#7A8983',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFF4DA',
    borderRadius: 18,
    marginTop: 18,
    padding: 15,
  },
  infoTitle: {
    color: '#765C21',
    fontSize: 11,
    fontWeight: '900',
  },
  infoText: {
    color: '#806F4B',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
  },
  sourceButton: {
    alignItems: 'center',
    borderColor: '#1A594B',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 12,
  },
  sourceButtonText: {
    color: '#1A594B',
    fontSize: 10,
    fontWeight: '900',
  },
  sourceNote: {
    color: '#84918D',
    fontSize: 8,
    lineHeight: 14,
    marginHorizontal: 10,
    marginTop: 12,
    textAlign: 'center',
  },
});
