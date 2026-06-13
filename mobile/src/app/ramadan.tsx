import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

import { LocationSelector } from '@/components/location-selector';
import { usePrayerTimes } from '@/hooks/use-prayer-times';
import { getIstanbulDateKey } from '@/services/daily-content-date';
import {
  buildRamadanSchedules,
  formatFastingDuration,
  formatRamadanDate,
  formatRamadanShortDate,
  getRamadanSummary,
  getUpcomingRamadan,
} from '@/services/ramadan';
import type { RamadanDay } from '@/types/ramadan';

function prayerTime(day: RamadanDay, key: RamadanDay['prayers'][number]['key']) {
  return day.prayers.find((prayer) => prayer.key === key)?.time ?? '--:--';
}

export default function RamadanScreen() {
  const router = useRouter();
  const todayKey = getIstanbulDateKey();
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedHijriYear, setSelectedHijriYear] = useState<number | null>(
    null,
  );
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const {
    snapshot,
    loading,
    refreshing,
    error,
    notice,
    refreshCurrent,
    refreshFromDevice,
    selectLocation,
    getCities,
    getDistricts,
  } = usePrayerTimes();
  const schedules = useMemo(
    () => buildRamadanSchedules(snapshot?.schedule ?? []),
    [snapshot?.schedule],
  );
  const upcoming = useMemo(
    () => getUpcomingRamadan(todayKey, schedules),
    [schedules, todayKey],
  );
  const selectedSchedule =
    schedules.find((item) => item.hijriYear === selectedHijriYear) ??
    schedules.at(-1) ??
    null;
  const selectedDay =
    selectedSchedule?.days.find(
      (day) => day.ramadanDay === selectedDayNumber,
    ) ??
    selectedSchedule?.days[0] ??
    null;
  const summary = selectedSchedule
    ? getRamadanSummary(selectedSchedule)
    : null;
  const locationLabel = snapshot
    ? `${snapshot.location.district.name}, ${snapshot.location.city.name}`
    : 'Konum belirleniyor';
  const upcomingMonth = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    month: 'short',
  })
    .format(new Date(`${upcoming.startDateKey}T12:00:00+03:00`))
    .toLocaleUpperCase('tr-TR');

  useEffect(() => {
    if (!schedules.length) {
      return;
    }

    const active =
      schedules.find(
        (schedule) =>
          schedule.startDateKey <= todayKey &&
          schedule.endDateKey >= todayKey,
      ) ?? schedules.at(-1);
    if (!active) {
      return;
    }

    setSelectedHijriYear((current) => current ?? active.hijriYear);
    const today = active.days.find((day) => day.dateKey === todayKey);
    setSelectedDayNumber(today?.ramadanDay ?? 1);
  }, [schedules, todayKey]);

  const chooseSchedule = (hijriYear: number) => {
    setSelectedHijriYear(hijriYear);
    setSelectedDayNumber(1);
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
                accessibilityLabel="Dini günler takvimini aç"
                accessibilityRole="button"
                onPress={() => router.push('/holy-days')}
                style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Dini günler</Text>
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · RAMAZAN İMSAKİYESİ</Text>
            <Text style={styles.heroTitle}>Sahurdan iftara bütün ay</Text>
            <Text style={styles.heroSubtitle}>
              Seçtiğin ilçe için Diyanet’in resmî imsak, iftar ve namaz vakitleri.
            </Text>

            <View style={styles.upcomingCard}>
              <View style={styles.upcomingDate}>
                <Text style={styles.upcomingDateDay}>
                  {upcoming.startDateKey.slice(8, 10)}
                </Text>
                <Text style={styles.upcomingDateMonth}>{upcomingMonth}</Text>
              </View>
              <View style={styles.upcomingCopy}>
                <Text style={styles.upcomingLabel}>
                  {upcoming.daysUntil > 0
                    ? 'YAKLAŞAN RAMAZAN'
                    : 'RAMAZAN'}
                </Text>
                <Text style={styles.upcomingTitle}>
                  Ramazan {upcoming.hijriYear}
                </Text>
                <Text style={styles.upcomingSubtitle}>
                  {formatRamadanDate(upcoming.startDateKey)}
                </Text>
              </View>
              <View style={styles.countdown}>
                <Text style={styles.countdownValue}>
                  {Math.max(0, upcoming.daysUntil)}
                </Text>
                <Text style={styles.countdownLabel}>GÜN</Text>
              </View>
            </View>

            {!upcoming.hasOfficialTimes ? (
              <Text style={styles.publishNotice}>
                {upcoming.gregorianYear} saatleri Diyanet tarafından
                yayımlandığında konumuna göre otomatik eklenecek.
              </Text>
            ) : null}
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <Pressable
            accessibilityLabel="İmsakiye konumunu değiştir"
            accessibilityRole="button"
            onPress={() => setSelectorVisible(true)}
            style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>⌖</Text>
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationLabel}>İMSAKİYE KONUMU</Text>
              <Text style={styles.locationTitle}>{locationLabel}</Text>
              <Text style={styles.locationSubtitle}>
                İl veya ilçeyi değiştir
              </Text>
            </View>
            <Text style={styles.locationArrow}>›</Text>
          </Pressable>

          {notice ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {loading && !snapshot ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#1A594B" size="large" />
              <Text style={styles.loadingText}>
                Konum ve yıllık Diyanet vakitleri hazırlanıyor
              </Text>
            </View>
          ) : null}

          {error && !snapshot ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{error}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void refreshFromDevice()}
                style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>Tekrar dene</Text>
              </Pressable>
            </View>
          ) : null}

          {schedules.length ? (
            <>
              <View style={styles.scheduleTabs}>
                {schedules.map((schedule) => (
                  <Pressable
                    key={schedule.hijriYear}
                    accessibilityLabel={`${schedule.title} imsakiyesini göster`}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected:
                        selectedSchedule?.hijriYear === schedule.hijriYear,
                    }}
                    onPress={() => chooseSchedule(schedule.hijriYear)}
                    style={[
                      styles.scheduleTab,
                      selectedSchedule?.hijriYear === schedule.hijriYear &&
                        styles.scheduleTabActive,
                    ]}>
                    <Text
                      style={[
                        styles.scheduleTabText,
                        selectedSchedule?.hijriYear === schedule.hijriYear &&
                          styles.scheduleTabTextActive,
                      ]}>
                      {schedule.gregorianYear} · {schedule.hijriYear}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {selectedSchedule && summary ? (
                <>
                  <View style={styles.summaryCard}>
                    <View>
                      <Text style={styles.summaryEyebrow}>
                        DİYANET RESMÎ İMSAKİYESİ
                      </Text>
                      <Text style={styles.summaryTitle}>
                        {selectedSchedule.title}
                      </Text>
                      <Text style={styles.summaryDate}>
                        {formatRamadanShortDate(
                          selectedSchedule.startDateKey,
                        )}{' '}
                        - {formatRamadanShortDate(selectedSchedule.endDateKey)}
                      </Text>
                    </View>
                    <View style={styles.summaryStats}>
                      <View style={styles.summaryStat}>
                        <Text style={styles.summaryValue}>
                          {summary.dayCount}
                        </Text>
                        <Text style={styles.summaryStatLabel}>gün</Text>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryStat}>
                        <Text style={styles.summaryValue}>
                          {formatFastingDuration(
                            summary.shortest.fastingMinutes,
                          )}
                        </Text>
                        <Text style={styles.summaryStatLabel}>
                          en kısa
                        </Text>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryStat}>
                        <Text style={styles.summaryValue}>
                          {formatFastingDuration(
                            summary.longest.fastingMinutes,
                          )}
                        </Text>
                        <Text style={styles.summaryStatLabel}>
                          en uzun
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.daySelectorTitle}>Günü seç</Text>
                  <ScrollView
                    horizontal
                    contentContainerStyle={styles.daySelector}
                    showsHorizontalScrollIndicator={false}>
                    {selectedSchedule.days.map((day) => (
                      <Pressable
                        key={day.dateKey}
                        accessibilityLabel={`Ramazan ${day.ramadanDay}. günü göster`}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected:
                            day.ramadanDay === selectedDay?.ramadanDay,
                        }}
                        onPress={() => setSelectedDayNumber(day.ramadanDay)}
                        style={[
                          styles.dayButton,
                          day.ramadanDay === selectedDay?.ramadanDay &&
                            styles.dayButtonActive,
                        ]}>
                        <Text
                          style={[
                            styles.dayButtonNumber,
                            day.ramadanDay === selectedDay?.ramadanDay &&
                              styles.dayButtonNumberActive,
                          ]}>
                          {day.ramadanDay}
                        </Text>
                        <Text
                          style={[
                            styles.dayButtonLabel,
                            day.ramadanDay === selectedDay?.ramadanDay &&
                              styles.dayButtonLabelActive,
                          ]}>
                          {formatRamadanShortDate(day.dateKey)}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {selectedDay ? (
                    <View style={styles.featuredCard}>
                      <View style={styles.featuredHeader}>
                        <View>
                          <Text style={styles.featuredEyebrow}>
                            RAMAZAN {selectedDay.ramadanDay}. GÜN
                          </Text>
                          <Text style={styles.featuredDate}>
                            {formatRamadanDate(selectedDay.dateKey)}
                          </Text>
                          <Text style={styles.featuredHijri}>
                            {selectedDay.hijriDate}
                          </Text>
                        </View>
                        <View style={styles.durationBadge}>
                          <Text style={styles.durationValue}>
                            {formatFastingDuration(
                              selectedDay.fastingMinutes,
                            )}
                          </Text>
                          <Text style={styles.durationLabel}>oruç süresi</Text>
                        </View>
                      </View>

                      <View style={styles.mainTimes}>
                        <View style={styles.mainTime}>
                          <Text style={styles.mainTimeLabel}>SAHUR BİTİŞİ</Text>
                          <Text style={styles.mainTimeName}>İmsak</Text>
                          <Text style={styles.mainTimeValue}>
                            {selectedDay.imsak}
                          </Text>
                        </View>
                        <View style={styles.mainTimeDivider} />
                        <View style={styles.mainTime}>
                          <Text style={styles.mainTimeLabel}>ORUÇ AÇILIŞI</Text>
                          <Text style={styles.mainTimeName}>İftar</Text>
                          <Text style={styles.mainTimeValue}>
                            {selectedDay.iftar}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.otherTimes}>
                        {(['gunes', 'ogle', 'ikindi', 'yatsi'] as const).map(
                          (key) => {
                            const names = {
                              gunes: 'Güneş',
                              ogle: 'Öğle',
                              ikindi: 'İkindi',
                              yatsi: 'Yatsı',
                            };
                            return (
                              <View key={key} style={styles.otherTime}>
                                <Text style={styles.otherTimeName}>
                                  {names[key]}
                                </Text>
                                <Text style={styles.otherTimeValue}>
                                  {prayerTime(selectedDay, key)}
                                </Text>
                              </View>
                            );
                          },
                        )}
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.tableHeader}>
                    <View>
                      <Text style={styles.tableEyebrow}>TÜM AY</Text>
                      <Text style={styles.tableTitle}>
                        Günlük imsak ve iftar
                      </Text>
                    </View>
                    <Text style={styles.tableCount}>
                      {selectedSchedule.days.length} gün
                    </Text>
                  </View>

                  <View style={styles.tableCard}>
                    <View style={styles.columnHeader}>
                      <Text style={[styles.columnText, styles.dayColumn]}>
                        Gün
                      </Text>
                      <Text style={styles.columnText}>İmsak</Text>
                      <Text style={styles.columnText}>İftar</Text>
                      <Text style={styles.columnText}>Süre</Text>
                    </View>
                    {selectedSchedule.days.map((day) => (
                      <Pressable
                        key={day.dateKey}
                        accessibilityLabel={`Ramazan ${day.ramadanDay}. gün ayrıntısını aç`}
                        accessibilityRole="button"
                        onPress={() => setSelectedDayNumber(day.ramadanDay)}
                        style={[
                          styles.tableRow,
                          day.ramadanDay === selectedDay?.ramadanDay &&
                            styles.tableRowActive,
                        ]}>
                        <View style={styles.dayColumn}>
                          <Text style={styles.rowDay}>
                            {day.ramadanDay}
                          </Text>
                          <Text style={styles.rowDate}>
                            {formatRamadanShortDate(day.dateKey)}
                          </Text>
                        </View>
                        <Text style={styles.rowTime}>{day.imsak}</Text>
                        <Text style={styles.rowTime}>{day.iftar}</Text>
                        <Text style={styles.rowDuration}>
                          {formatFastingDuration(day.fastingMinutes)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}
            </>
          ) : !loading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                Resmî yıllık vakitler hazırlanıyor
              </Text>
              <Text style={styles.emptyText}>
                Konumu yenilediğinde Diyanet’in yayımladığı yıllık Ramazan
                satırları burada otomatik listelenir.
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityLabel="İmsakiye verisini yenile"
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
              <Text style={styles.refreshButtonText}>
                Diyanet imsakiyesini yenile
              </Text>
            )}
          </Pressable>

          {snapshot?.sourceUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(snapshot.sourceUrl)}
              style={styles.sourceButton}>
              <Text style={styles.sourceButtonText}>Diyanet kaynağını aç</Text>
            </Pressable>
          ) : null}

          <Text style={styles.sourceNote}>
            İmsak ve iftar saatleri seçili ilçe için Diyanet İşleri
            Başkanlığının yıllık namaz vakti tablosundan alınır. Yeni yılın
            vakitleri yayımlandığında MIHRAB otomatik olarak yeni Ramazan
            imsakiyesini oluşturur.
          </Text>
        </View>
      </ScrollView>

      <LocationSelector
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        onUseDeviceLocation={refreshFromDevice}
        onSelect={selectLocation}
        getCities={getCities}
        getDistricts={getDistricts}
      />
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
    paddingBottom: 24,
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
  upcomingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 20,
    flexDirection: 'row',
    marginTop: 21,
    padding: 13,
  },
  upcomingDate: {
    alignItems: 'center',
    backgroundColor: '#F1CF82',
    borderRadius: 15,
    height: 53,
    justifyContent: 'center',
    marginRight: 11,
    width: 53,
  },
  upcomingDateDay: {
    color: '#174D42',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 23,
  },
  upcomingDateMonth: {
    color: '#42655B',
    fontSize: 8,
    fontWeight: '800',
  },
  upcomingCopy: {
    flex: 1,
  },
  upcomingLabel: {
    color: '#A9C6BB',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  upcomingTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  upcomingSubtitle: {
    color: '#C5D8D1',
    fontSize: 8,
    marginTop: 3,
  },
  countdown: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    minWidth: 51,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  countdownValue: {
    color: '#F1CF82',
    fontSize: 17,
    fontWeight: '900',
  },
  countdownLabel: {
    color: '#C9DBD4',
    fontSize: 6,
    fontWeight: '900',
    marginTop: 1,
  },
  publishNotice: {
    color: '#ADC5BC',
    fontSize: 8,
    lineHeight: 13,
    marginHorizontal: 4,
    marginTop: 9,
  },
  body: {
    paddingHorizontal: 17,
    paddingTop: 19,
  },
  locationCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 14,
  },
  locationIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F1EC',
    borderRadius: 14,
    height: 43,
    justifyContent: 'center',
    marginRight: 11,
    width: 43,
  },
  locationIconText: {
    color: '#1A594B',
    fontSize: 19,
  },
  locationCopy: {
    flex: 1,
  },
  locationLabel: {
    color: '#1D6555',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  locationTitle: {
    color: '#263A33',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },
  locationSubtitle: {
    color: '#81908A',
    fontSize: 8,
    marginTop: 2,
  },
  locationArrow: {
    color: '#74867F',
    fontSize: 25,
  },
  noticeCard: {
    backgroundColor: '#FFF4DA',
    borderRadius: 16,
    marginBottom: 14,
    padding: 13,
  },
  noticeText: {
    color: '#786536',
    fontSize: 9,
    lineHeight: 15,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A594B',
    borderRadius: 10,
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  inlineButtonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,
    padding: 25,
  },
  loadingText: {
    color: '#6F7F79',
    fontSize: 10,
    marginTop: 10,
  },
  scheduleTabs: {
    backgroundColor: '#E4ECE8',
    borderRadius: 17,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 4,
  },
  scheduleTab: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 10,
  },
  scheduleTabActive: {
    backgroundColor: '#174D42',
  },
  scheduleTabText: {
    color: '#61736C',
    fontSize: 10,
    fontWeight: '900',
  },
  scheduleTabTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFF3D5',
    borderColor: '#E8D19A',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  summaryEyebrow: {
    color: '#8A651E',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  summaryTitle: {
    color: '#393529',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryDate: {
    color: '#80755D',
    fontSize: 9,
    marginTop: 3,
  },
  summaryStats: {
    alignItems: 'center',
    borderTopColor: '#E3D2A8',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 13,
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: '#174D42',
    fontSize: 12,
    fontWeight: '900',
  },
  summaryStatLabel: {
    color: '#897C5E',
    fontSize: 7,
    marginTop: 2,
  },
  summaryDivider: {
    backgroundColor: '#DDCAA0',
    height: 25,
    width: StyleSheet.hairlineWidth,
  },
  daySelectorTitle: {
    color: '#53665F',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 18,
  },
  daySelector: {
    gap: 8,
    paddingVertical: 10,
  },
  dayButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE6E2',
    borderRadius: 15,
    borderWidth: 1,
    minWidth: 53,
    paddingHorizontal: 9,
    paddingVertical: 9,
  },
  dayButtonActive: {
    backgroundColor: '#174D42',
    borderColor: '#174D42',
  },
  dayButtonNumber: {
    color: '#263A33',
    fontSize: 14,
    fontWeight: '900',
  },
  dayButtonNumberActive: {
    color: '#F1CF82',
  },
  dayButtonLabel: {
    color: '#89958F',
    fontSize: 7,
    marginTop: 2,
  },
  dayButtonLabelActive: {
    color: '#C8DBD4',
  },
  featuredCard: {
    backgroundColor: '#174D42',
    borderRadius: 23,
    padding: 17,
  },
  featuredHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredEyebrow: {
    color: '#F1CF82',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuredDate: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  featuredHijri: {
    color: '#AFC8BF',
    fontSize: 8,
    marginTop: 3,
  },
  durationBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  durationValue: {
    color: '#F1CF82',
    fontSize: 10,
    fontWeight: '900',
  },
  durationLabel: {
    color: '#BDD0C9',
    fontSize: 6,
    marginTop: 2,
  },
  mainTimes: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 17,
    flexDirection: 'row',
    marginTop: 15,
    padding: 14,
  },
  mainTime: {
    alignItems: 'center',
    flex: 1,
  },
  mainTimeLabel: {
    color: '#AFC8BF',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  mainTimeName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  mainTimeValue: {
    color: '#F1CF82',
    fontSize: 25,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    marginTop: 2,
  },
  mainTimeDivider: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    height: 52,
    width: 1,
  },
  otherTimes: {
    flexDirection: 'row',
    marginTop: 13,
  },
  otherTime: {
    alignItems: 'center',
    flex: 1,
  },
  otherTimeName: {
    color: '#AFC8BF',
    fontSize: 7,
  },
  otherTimeValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    marginTop: 3,
  },
  tableHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
    marginTop: 21,
  },
  tableEyebrow: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  tableTitle: {
    color: '#263A33',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  tableCount: {
    color: '#84918D',
    fontSize: 8,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  columnHeader: {
    backgroundColor: '#E8F1EC',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  columnText: {
    color: '#657870',
    flex: 1,
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'right',
  },
  dayColumn: {
    flex: 1.3,
    textAlign: 'left',
  },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: '#E8EEEA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  tableRowActive: {
    backgroundColor: '#FFF6DF',
  },
  rowDay: {
    color: '#263A33',
    fontSize: 12,
    fontWeight: '900',
  },
  rowDate: {
    color: '#8A9691',
    fontSize: 7,
    marginTop: 1,
  },
  rowTime: {
    color: '#33453E',
    flex: 1,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    textAlign: 'right',
  },
  rowDuration: {
    color: '#6F7E78',
    flex: 1,
    fontSize: 8,
    textAlign: 'right',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  emptyTitle: {
    color: '#263A33',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    color: '#798781',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 49,
  },
  pressed: {
    opacity: 0.8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  sourceButton: {
    alignItems: 'center',
    borderColor: '#1A594B',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 11,
  },
  sourceButtonText: {
    color: '#1A594B',
    fontSize: 9,
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
