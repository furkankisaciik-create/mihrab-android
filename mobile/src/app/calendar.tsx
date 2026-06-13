import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import { usePrayerTimes } from '@/hooks/use-prayer-times';
import {
  buildHijriMonth,
  formatGregorianCalendarDate,
  getHijriDate,
  shiftHijriMonth,
} from '@/services/hijri-calendar';
import { getIstanbulDateKey } from '@/services/daily-content-date';
import {
  formatReligiousCountdown,
  getDaysUntil,
  getNextReligiousDay,
  getReligiousDaysOn,
} from '@/services/religious-days';

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function HijriCalendarScreen() {
  const router = useRouter();
  const todayKey = getIstanbulDateKey();
  const [anchorDateKey, setAnchorDateKey] = useState(todayKey);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const { snapshot, loading, refreshing, error, notice, refreshCurrent } =
    usePrayerTimes();
  const schedule = useMemo(() => snapshot?.schedule ?? [], [snapshot?.schedule]);
  const month = useMemo(
    () => buildHijriMonth(anchorDateKey, schedule, todayKey),
    [anchorDateKey, schedule, todayKey],
  );
  const selected =
    month.days.find((day) => day.dateKey === selectedDateKey) ??
    getHijriDate(selectedDateKey, schedule, month.calibrationOffset);
  const selectedSchedule = schedule.find(
    (day) => day.dateKey === selectedDateKey,
  );
  const selectedReligiousDays = getReligiousDaysOn(selectedDateKey);
  const nextReligiousDay = getNextReligiousDay(todayKey);
  const nextReligiousDaysUntil = nextReligiousDay
    ? getDaysUntil(nextReligiousDay.dateKey, todayKey)
    : null;
  const locationLabel = snapshot
    ? `${snapshot.location.district.name}, ${snapshot.location.city.name}`
    : 'Türkiye';

  const changeMonth = (direction: -1 | 1) => {
    const nextAnchor = shiftHijriMonth(anchorDateKey, direction, schedule);
    setAnchorDateKey(nextAnchor);
    setSelectedDateKey(nextAnchor);
  };

  const selectDate = (dateKey: string, isInMonth: boolean) => {
    setSelectedDateKey(dateKey);
    if (!isInMonth) {
      setAnchorDateKey(dateKey);
    }
  };

  const returnToToday = () => {
    setAnchorDateKey(todayKey);
    setSelectedDateKey(todayKey);
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
                accessibilityLabel="Bugüne dön"
                accessibilityRole="button"
                onPress={returnToToday}
                style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Bugün</Text>
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · HİCRİ TAKVİM</Text>
            <Text style={styles.heroTitle}>Günü iki takvimle yaşa</Text>
            <Text style={styles.heroSubtitle}>
              Diyanet tarihleri öncelikli, Türkiye saatine göre kesintisiz Hicri
              takvim.
            </Text>

            <View style={styles.todayCard}>
              <View>
                <Text style={styles.todayLabel}>BUGÜN</Text>
                <Text style={styles.todayHijri}>
                  {getHijriDate(todayKey, schedule).label}
                </Text>
                <Text style={styles.todayGregorian}>
                  {formatGregorianCalendarDate(todayKey)}
                </Text>
              </View>
              <View style={styles.locationBadge}>
                <View
                  style={[
                    styles.sourceDot,
                    !snapshot && styles.sourceDotCalculated,
                  ]}
                />
                <Text numberOfLines={1} style={styles.locationText}>
                  {locationLabel}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {notice ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {error && !snapshot ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                Hicri takvim kullanılabilir. Diyanet konum verisi geldiğinde
                resmî tarih ve vakitler otomatik eşleşir.
              </Text>
            </View>
          ) : null}

          {nextReligiousDay && nextReligiousDaysUntil !== null ? (
            <Pressable
              accessibilityLabel="Dini günler ve geceler takvimini aç"
              accessibilityRole="button"
              onPress={() => router.push('/holy-days' as Href)}
              style={({ pressed }) => [
                styles.religiousDayBanner,
                pressed && styles.pressed,
              ]}>
              <View style={styles.religiousDayIcon}>
                <Text style={styles.religiousDayIconText}>✦</Text>
              </View>
              <View style={styles.religiousDayCopy}>
                <Text style={styles.religiousDayEyebrow}>SIRADAKİ DİNİ GÜN</Text>
                <Text style={styles.religiousDayTitle}>
                  {nextReligiousDay.name}
                </Text>
                <Text style={styles.religiousDayDate}>
                  {nextReligiousDay.hijriDate} ·{' '}
                  {formatReligiousCountdown(nextReligiousDaysUntil)}
                </Text>
              </View>
              <Text style={styles.religiousDayArrow}>›</Text>
            </Pressable>
          ) : null}

          <View style={styles.calendarCard}>
            <View style={styles.monthHeader}>
              <Pressable
                accessibilityLabel="Önceki Hicri ay"
                accessibilityRole="button"
                onPress={() => changeMonth(-1)}
                style={styles.monthButton}>
                <Text style={styles.monthButtonText}>‹</Text>
              </Pressable>
              <View style={styles.monthCopy}>
                <Text style={styles.monthTitle}>{month.title}</Text>
                <Text style={styles.monthSubtitle}>Hicri ay görünümü</Text>
              </View>
              <Pressable
                accessibilityLabel="Sonraki Hicri ay"
                accessibilityRole="button"
                onPress={() => changeMonth(1)}
                style={styles.monthButton}>
                <Text style={styles.monthButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekHeader}>
              {WEEKDAYS.map((weekday) => (
                <Text key={weekday} style={styles.weekday}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {month.days.map((day) => {
                const isSelected = day.dateKey === selectedDateKey;
                const religiousDays = getReligiousDaysOn(day.dateKey);
                return (
                  <Pressable
                    key={day.dateKey}
                    accessibilityLabel={`${day.label}, ${day.gregorianLabel}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => selectDate(day.dateKey, day.isInMonth)}
                    style={styles.dayCell}>
                    <View
                      style={[
                        styles.dayCircle,
                        day.isToday && styles.todayCircle,
                        isSelected && styles.selectedCircle,
                      ]}>
                      <Text
                        style={[
                          styles.hijriDay,
                          !day.isInMonth && styles.outsideMonthText,
                          day.isToday && styles.todayText,
                          isSelected && styles.selectedText,
                        ]}>
                        {day.day}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.gregorianDay,
                        !day.isInMonth && styles.outsideMonthText,
                      ]}>
                      {day.gregorianDay}
                    </Text>
                    <View style={styles.dayMarkers}>
                      {day.isOfficial ? <View style={styles.officialDot} /> : null}
                      {religiousDays.length ? (
                        <View style={styles.religiousDayDot} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.officialDot} />
                <Text style={styles.legendText}>Diyanet tarihi</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.religiousDayDot} />
                <Text style={styles.legendText}>Dini gün</Text>
              </View>
              <Text style={styles.legendText}>Büyük sayı Hicri · küçük sayı Miladi</Text>
            </View>
          </View>

          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedDateBlock}>
                <Text style={styles.selectedDay}>{selected.day}</Text>
                <Text numberOfLines={1} style={styles.selectedMonth}>
                  {selected.month}
                </Text>
              </View>
              <View style={styles.selectedCopy}>
                <View style={styles.selectedEyebrowRow}>
                  <Text style={styles.selectedEyebrow}>SEÇİLEN GÜN</Text>
                  {selected.isOfficial ? (
                    <View style={styles.diyanetBadge}>
                      <Text style={styles.diyanetBadgeText}>DİYANET</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.selectedTitle}>{selected.label}</Text>
                <Text style={styles.selectedGregorian}>
                  {formatGregorianCalendarDate(selectedDateKey)}
                </Text>
              </View>
            </View>

            {selectedReligiousDays.length ? (
              <Pressable
                accessibilityLabel="Seçilen tarihin dini gün ayrıntılarını aç"
                accessibilityRole="button"
                onPress={() => router.push('/holy-days' as Href)}
                style={styles.selectedReligiousDays}>
                <Text style={styles.selectedReligiousLabel}>
                  BU TARİHTEKİ DİNİ GÜN
                </Text>
                {selectedReligiousDays.map((day) => (
                  <Text key={day.id} style={styles.selectedReligiousTitle}>
                    ✦ {day.name}
                  </Text>
                ))}
              </Pressable>
            ) : null}

            {selectedSchedule ? (
              <View style={styles.prayerGrid}>
                {selectedSchedule.prayers.map((prayer) => (
                  <View key={prayer.key} style={styles.prayerItem}>
                    <Text style={styles.prayerName}>{prayer.name}</Text>
                    <Text style={styles.prayerTime}>{prayer.time}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.scheduleNotice}>
                <Text style={styles.scheduleNoticeTitle}>
                  Diyanet vakitleri veri aralığı dışında
                </Text>
                <Text style={styles.scheduleNoticeText}>
                  Güncel konum verisi yenilendiğinde yakın tarihlerdeki namaz
                  vakitleri burada görünür.
                </Text>
              </View>
            )}
          </View>

          <Pressable
            accessibilityLabel="Diyanet tarih ve vakit verisini yenile"
            accessibilityRole="button"
            disabled={loading || refreshing}
            onPress={() => void refreshCurrent()}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.pressed,
            ]}>
            {loading || refreshing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.refreshButtonText}>Tarih ve vakitleri yenile</Text>
            )}
          </Pressable>

          <Text style={styles.sourceNote}>
            Diyanet’in güncel namaz vakti tablosunda yer alan Hicri tarihler
            resmî kaynak olarak gösterilir. Diğer günler, Türkiye saat diliminde
            kalibre edilmiş Hicri takvim hesabıyla tamamlanır.
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
    fontSize: 29,
    fontWeight: '900',
    marginTop: 6,
  },
  heroSubtitle: {
    color: '#BCD0C8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 330,
  },
  todayCard: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 21,
    padding: 15,
  },
  todayLabel: {
    color: '#A9C6BB',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  todayHijri: {
    color: '#F4D88F',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  todayGregorian: {
    color: '#D4E1DC',
    fontSize: 9,
    marginTop: 3,
  },
  locationBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    maxWidth: 120,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  locationText: {
    color: '#D7E4DF',
    flexShrink: 1,
    fontSize: 8,
    fontWeight: '700',
  },
  sourceDot: {
    backgroundColor: '#65B59E',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  sourceDotCalculated: {
    backgroundColor: '#F1CF82',
  },
  body: {
    paddingHorizontal: 17,
    paddingTop: 19,
  },
  noticeCard: {
    backgroundColor: '#FFF5DC',
    borderRadius: 15,
    marginBottom: 14,
    padding: 13,
  },
  noticeText: {
    color: '#75612F',
    fontSize: 10,
    lineHeight: 16,
  },
  religiousDayBanner: {
    alignItems: 'center',
    backgroundColor: '#FFF4DA',
    borderColor: '#E8D19A',
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 13,
  },
  religiousDayIcon: {
    alignItems: 'center',
    backgroundColor: '#174D42',
    borderRadius: 14,
    height: 43,
    justifyContent: 'center',
    marginRight: 11,
    width: 43,
  },
  religiousDayIconText: {
    color: '#F1CF82',
    fontSize: 18,
  },
  religiousDayCopy: {
    flex: 1,
  },
  religiousDayEyebrow: {
    color: '#8A651E',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  religiousDayTitle: {
    color: '#3D392B',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },
  religiousDayDate: {
    color: '#806F4B',
    fontSize: 8,
    marginTop: 2,
  },
  religiousDayArrow: {
    color: '#856D39',
    fontSize: 25,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingHorizontal: 12,
    paddingVertical: 17,
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  monthButton: {
    alignItems: 'center',
    backgroundColor: '#E9F1ED',
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  monthButtonText: {
    color: '#1A594B',
    fontSize: 27,
    lineHeight: 29,
  },
  monthCopy: {
    alignItems: 'center',
  },
  monthTitle: {
    color: '#20332D',
    fontSize: 18,
    fontWeight: '900',
  },
  monthSubtitle: {
    color: '#86938E',
    fontSize: 8,
    marginTop: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    marginTop: 19,
  },
  weekday: {
    color: '#7B8984',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    width: '14.2857%',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayCell: {
    alignItems: 'center',
    height: 61,
    justifyContent: 'center',
    position: 'relative',
    width: '14.2857%',
  },
  dayCircle: {
    alignItems: 'center',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  todayCircle: {
    borderColor: '#1A594B',
    borderWidth: 1.5,
  },
  selectedCircle: {
    backgroundColor: '#174D42',
    borderColor: '#174D42',
  },
  hijriDay: {
    color: '#263A33',
    fontSize: 14,
    fontWeight: '900',
  },
  todayText: {
    color: '#174D42',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  gregorianDay: {
    color: '#97A29E',
    fontSize: 8,
    marginTop: 1,
  },
  outsideMonthText: {
    opacity: 0.3,
  },
  officialDot: {
    backgroundColor: '#C69A3A',
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  religiousDayDot: {
    backgroundColor: '#D49A2A',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dayMarkers: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    height: 6,
  },
  legend: {
    alignItems: 'center',
    borderTopColor: '#E8EEEA',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendText: {
    color: '#84918D',
    fontSize: 8,
  },
  selectedCard: {
    backgroundColor: '#FFF4DA',
    borderColor: '#E8D19A',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  selectedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  selectedDateBlock: {
    alignItems: 'center',
    backgroundColor: '#174D42',
    borderRadius: 17,
    height: 58,
    justifyContent: 'center',
    marginRight: 13,
    width: 58,
  },
  selectedDay: {
    color: '#F1CF82',
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 25,
  },
  selectedMonth: {
    color: '#FFFFFF',
    fontSize: 8,
    maxWidth: 50,
  },
  selectedCopy: {
    flex: 1,
  },
  selectedEyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  selectedEyebrow: {
    color: '#8A651E',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  diyanetBadge: {
    backgroundColor: '#E5D4A6',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diyanetBadgeText: {
    color: '#72551C',
    fontSize: 7,
    fontWeight: '900',
  },
  selectedTitle: {
    color: '#383528',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  selectedGregorian: {
    color: '#7D735C',
    fontSize: 9,
    marginTop: 3,
  },
  selectedReligiousDays: {
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderRadius: 13,
    marginTop: 13,
    padding: 11,
  },
  selectedReligiousLabel: {
    color: '#8A651E',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  selectedReligiousTitle: {
    color: '#4B4128',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  prayerGrid: {
    borderTopColor: '#E4D3A9',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    paddingTop: 11,
  },
  prayerItem: {
    marginVertical: 5,
    width: '33.333%',
  },
  prayerName: {
    color: '#817352',
    fontSize: 8,
    fontWeight: '700',
  },
  prayerTime: {
    color: '#3E3A2E',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    marginTop: 2,
  },
  scheduleNotice: {
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderRadius: 14,
    marginTop: 14,
    padding: 12,
  },
  scheduleNoticeTitle: {
    color: '#6D592B',
    fontSize: 10,
    fontWeight: '800',
  },
  scheduleNoticeText: {
    color: '#897A59',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 50,
  },
  pressed: {
    opacity: 0.8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  sourceNote: {
    color: '#84918D',
    fontSize: 9,
    lineHeight: 15,
    marginHorizontal: 12,
    marginTop: 14,
    textAlign: 'center',
  },
});
