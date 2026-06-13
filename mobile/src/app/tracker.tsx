import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
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

import { usePrayerTracker } from '@/hooks/use-prayer-tracker';
import { formatDailyContentDate, getIstanbulDateKey } from '@/services/daily-content-date';
import { loadPrayerSnapshot } from '@/services/prayer-cache';
import { TRACKED_PRAYERS } from '@/services/prayer-tracker';
import type { PrayerTime, PrayerTimesSnapshot } from '@/types/prayer';
import type { TrackedPrayerKey } from '@/types/prayer-tracker';

type PrayerStatus = 'completed' | 'current' | 'passed' | 'upcoming' | 'unknown';

const STATUS_LABELS: Record<PrayerStatus, string> = {
  completed: 'Kılındı',
  current: 'Vakti geldi',
  passed: 'Vakti geçti',
  upcoming: 'Yaklaşan',
  unknown: 'Vakit bekleniyor',
};

function getSchedule(snapshot: PrayerTimesSnapshot | null, dateKey: string) {
  if (!snapshot) {
    return [];
  }
  return (
    snapshot.schedule?.find((day) => day.dateKey === dateKey)?.prayers ??
    (snapshot.dateKey === dateKey ? snapshot.prayers : [])
  );
}

function getTime(prayers: PrayerTime[], key: PrayerTime['key']) {
  return prayers.find((prayer) => prayer.key === key)?.time ?? '--:--';
}

function getPrayerDate(dateKey: string, time: string) {
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  return new Date(`${dateKey}T${time}:00+03:00`);
}

function getPrayerStatus(
  key: TrackedPrayerKey,
  completed: boolean,
  prayers: PrayerTime[],
  dateKey: string,
  now: Date,
): PrayerStatus {
  if (completed) {
    return 'completed';
  }

  const index = TRACKED_PRAYERS.findIndex((prayer) => prayer.key === key);
  const prayer = TRACKED_PRAYERS[index];
  const start = getPrayerDate(dateKey, getTime(prayers, prayer.scheduleKey));
  if (!start) {
    return 'unknown';
  }

  const nextPrayer = TRACKED_PRAYERS[index + 1];
  const endKey = key === 'sabah' ? 'gunes' : nextPrayer?.scheduleKey;
  const end = endKey ? getPrayerDate(dateKey, getTime(prayers, endKey)) : null;

  if (now < start) {
    return 'upcoming';
  }
  if (!end || now < end) {
    return 'current';
  }
  return 'passed';
}

function getShortDay(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
  })
    .format(new Date(`${dateKey}T12:00:00+03:00`))
    .replace('.', '');
}

export default function PrayerTrackerScreen() {
  const router = useRouter();
  const { state, loading, summary, toggle } = usePrayerTracker();
  const [snapshot, setSnapshot] = useState<PrayerTimesSnapshot | null>(null);
  const [now, setNow] = useState(new Date());
  const today = state.days[state.currentDateKey];
  const progress = (summary.todayCompleted / TRACKED_PRAYERS.length) * 100;
  const schedule = useMemo(
    () => getSchedule(snapshot, state.currentDateKey),
    [snapshot, state.currentDateKey],
  );

  useEffect(() => {
    void loadPrayerSnapshot().then(setSnapshot);
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#1A594B" size="large" />
        <Text style={styles.loadingText}>Namaz takibi hazırlanıyor</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <Text style={styles.eyebrow}>MIHRAB · GÜNLÜK İBADET</Text>
            <Text style={styles.title}>Namaz takibi</Text>
            <Text style={styles.date}>{formatDailyContentDate(state.currentDateKey)}</Text>
            <Pressable
              accessibilityLabel="Kaza namazı takibini aç"
              accessibilityRole="button"
              onPress={() => router.push('/qada')}
              style={styles.qadaShortcut}>
              <Text style={styles.qadaShortcutText}>Kaza namazı takibine geç</Text>
              <Text style={styles.qadaShortcutIcon}>›</Text>
            </Pressable>

            <View style={styles.heroProgress}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCount}>{summary.todayCompleted}</Text>
                <Text style={styles.progressTotal}>/ 5</Text>
              </View>
              <View style={styles.heroProgressCopy}>
                <Text style={styles.heroProgressTitle}>
                  {summary.todayCompleted === 5
                    ? 'Bugünün namazları tamamlandı'
                    : `${5 - summary.todayCompleted} namaz kaldı`}
                </Text>
                <Text style={styles.heroProgressText}>
                  Her namazdan sonra işaretleyerek günlük düzeninizi takip edin.
                </Text>
                <View style={styles.heroProgressTrack}>
                  <View style={[styles.heroProgressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          {summary.todayCompleted === 5 && (
            <View style={styles.completedDayCard}>
              <View style={styles.completedDayIcon}>
                <Text style={styles.completedDayIconText}>✓</Text>
              </View>
              <View style={styles.completedDayCopy}>
                <Text style={styles.completedDayTitle}>Elhamdülillah, bugün tamamlandı</Text>
                <Text style={styles.completedDayText}>
                  Beş vakit namazın tamamını kaydettiniz.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>BUGÜN</Text>
              <Text style={styles.sectionTitle}>Beş vakit namaz</Text>
            </View>
            <View style={styles.sourceBadge}>
              <View style={[styles.sourceDot, !schedule.length && styles.sourceDotOffline]} />
              <Text style={styles.sourceText}>{schedule.length ? 'Diyanet vakitleri' : 'Saat bekleniyor'}</Text>
            </View>
          </View>

          <View style={styles.prayerList}>
            {TRACKED_PRAYERS.map((prayer) => {
              const completed = Boolean(today?.prayers[prayer.key]);
              const time = getTime(schedule, prayer.scheduleKey);
              const status = getPrayerStatus(
                prayer.key,
                completed,
                schedule,
                state.currentDateKey,
                now,
              );
              const isCurrent = status === 'current';
              const detail =
                prayer.key === 'sabah' && time !== '--:--'
                  ? `${time} · Güneş ${getTime(schedule, 'gunes')}`
                  : time;

              return (
                <Pressable
                  key={prayer.key}
                  accessibilityLabel={`${prayer.name} namazı, ${STATUS_LABELS[status]}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: completed }}
                  onPress={() => toggle(prayer.key)}
                  style={({ pressed }) => [
                    styles.prayerCard,
                    completed && styles.prayerCardCompleted,
                    isCurrent && styles.prayerCardCurrent,
                    pressed && styles.pressed,
                  ]}>
                  <View
                    style={[
                      styles.prayerSymbol,
                      completed && styles.prayerSymbolCompleted,
                      isCurrent && styles.prayerSymbolCurrent,
                    ]}>
                    <Text
                      style={[
                        styles.prayerSymbolText,
                        (completed || isCurrent) && styles.prayerSymbolTextActive,
                      ]}>
                      {prayer.symbol}
                    </Text>
                  </View>
                  <View style={styles.prayerCopy}>
                    <Text style={[styles.prayerName, completed && styles.prayerNameCompleted]}>
                      {prayer.name}
                    </Text>
                    <Text style={styles.prayerTime}>{detail}</Text>
                  </View>
                  <View style={styles.prayerStatus}>
                    <Text
                      style={[
                        styles.prayerStatusText,
                        completed && styles.prayerStatusTextCompleted,
                        isCurrent && styles.prayerStatusTextCurrent,
                      ]}>
                      {STATUS_LABELS[status]}
                    </Text>
                    <View style={[styles.check, completed && styles.checkCompleted]}>
                      {completed && <Text style={styles.checkText}>✓</Text>}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.statisticsTitle}>Son 7 gün</Text>
          <View style={styles.weekCard}>
            <View style={styles.weekBars}>
              {summary.week.map((day) => {
                const isToday = day.dateKey === getIstanbulDateKey();
                const height = Math.max(7, (day.completed / 5) * 54);
                return (
                  <View key={day.dateKey} style={styles.weekDay}>
                    <Text style={styles.weekCount}>{day.completed}</Text>
                    <View style={styles.weekBarTrack}>
                      <View
                        style={[
                          styles.weekBarFill,
                          isToday && styles.weekBarFillToday,
                          { height },
                        ]}
                      />
                    </View>
                    <Text style={[styles.weekLabel, isToday && styles.weekLabelToday]}>
                      {getShortDay(day.dateKey)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.statisticsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.lastSevenCompleted}</Text>
              <Text style={styles.statLabel}>Son 7 günde</Text>
              <Text style={styles.statHint}>35 namazdan</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.fullDays}</Text>
              <Text style={styles.statLabel}>Tam gün</Text>
              <Text style={styles.statHint}>Bu hafta</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.streak}</Text>
              <Text style={styles.statLabel}>Günlük seri</Text>
              <Text style={styles.statHint}>Tam gün</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Nasıl kullanılır?</Text>
            <Text style={styles.infoText}>
              Kıldığınız namazın satırına dokunun. Yanlış işaretlerseniz tekrar dokunarak geri
              alabilirsiniz. Bu bölüm günlük eda takibidir; kaza namazları için üstteki ayrı
              takip ekranını kullanabilirsiniz.
            </Text>
          </View>

          <Text style={styles.dataNotice}>
            Namaz kayıtları yalnızca bu cihazda saklanır. Hesap veya internet bağlantısı gerekmez.
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
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#F3F6F2',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#60716B',
    fontSize: 12,
    marginTop: 12,
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
    paddingBottom: 25,
    paddingHorizontal: 22,
    paddingTop: 12,
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
  date: {
    color: '#F1CF82',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 15,
    textTransform: 'capitalize',
  },
  qadaShortcut: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(241,207,130,0.24)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  qadaShortcutText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  qadaShortcutIcon: {
    color: '#F1CF82',
    fontSize: 19,
    fontWeight: '900',
  },
  heroProgress: {
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.13)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 17,
  },
  progressCircle: {
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(241,207,130,0.55)',
    borderRadius: 37,
    borderWidth: 2,
    flexDirection: 'row',
    height: 74,
    justifyContent: 'center',
    marginRight: 16,
    width: 74,
  },
  progressCount: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
  },
  progressTotal: {
    color: '#BCD0C8',
    fontSize: 11,
    fontWeight: '800',
  },
  heroProgressCopy: {
    flex: 1,
  },
  heroProgressTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  heroProgressText: {
    color: '#AFC9C0',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  heroProgressTrack: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 6,
    height: 6,
    marginTop: 10,
    overflow: 'hidden',
  },
  heroProgressFill: {
    backgroundColor: '#F1CF82',
    borderRadius: 6,
    height: '100%',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  completedDayCard: {
    alignItems: 'center',
    backgroundColor: '#FFF3D4',
    borderColor: '#E9D394',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 14,
  },
  completedDayIcon: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: 11,
    width: 36,
  },
  completedDayIconText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  completedDayCopy: {
    flex: 1,
  },
  completedDayTitle: {
    color: '#5C491D',
    fontSize: 13,
    fontWeight: '900',
  },
  completedDayText: {
    color: '#786B49',
    fontSize: 10,
    marginTop: 3,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionEyebrow: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  sectionTitle: {
    color: '#1C2A26',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 3,
  },
  sourceBadge: {
    alignItems: 'center',
    backgroundColor: '#E4ECE8',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sourceDot: {
    backgroundColor: '#2A806C',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  sourceDotOffline: {
    backgroundColor: '#C39A42',
  },
  sourceText: {
    color: '#557169',
    fontSize: 9,
    fontWeight: '700',
  },
  prayerList: {
    gap: 10,
  },
  prayerCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 75,
    paddingHorizontal: 14,
  },
  prayerCardCompleted: {
    backgroundColor: '#EAF4EE',
    borderColor: '#CCE2D6',
  },
  prayerCardCurrent: {
    borderColor: '#D9B95F',
  },
  prayerSymbol: {
    alignItems: 'center',
    backgroundColor: '#F0F3F1',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    width: 38,
  },
  prayerSymbolCompleted: {
    backgroundColor: '#1A594B',
  },
  prayerSymbolCurrent: {
    backgroundColor: '#B99131',
  },
  prayerSymbolText: {
    color: '#66766F',
    fontSize: 16,
  },
  prayerSymbolTextActive: {
    color: '#FFFFFF',
  },
  prayerCopy: {
    flex: 1,
  },
  prayerName: {
    color: '#293A34',
    fontSize: 15,
    fontWeight: '800',
  },
  prayerNameCompleted: {
    color: '#174D42',
  },
  prayerTime: {
    color: '#82908B',
    fontSize: 10,
    marginTop: 4,
  },
  prayerStatus: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 9,
  },
  prayerStatusText: {
    color: '#87938F',
    fontSize: 9,
    fontWeight: '800',
  },
  prayerStatusTextCompleted: {
    color: '#1A594B',
  },
  prayerStatusTextCurrent: {
    color: '#9A7421',
  },
  check: {
    borderColor: '#B9C5C0',
    borderRadius: 12,
    borderWidth: 1.5,
    height: 24,
    width: 24,
  },
  checkCompleted: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderColor: '#1A594B',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  statisticsTitle: {
    color: '#1C2A26',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 25,
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 11,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  weekBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    flex: 1,
  },
  weekCount: {
    color: '#70807A',
    fontSize: 9,
    fontWeight: '800',
  },
  weekBarTrack: {
    backgroundColor: '#E7ECE9',
    borderRadius: 6,
    height: 54,
    justifyContent: 'flex-end',
    marginTop: 5,
    overflow: 'hidden',
    width: 12,
  },
  weekBarFill: {
    backgroundColor: '#91B3A7',
    borderRadius: 6,
    width: '100%',
  },
  weekBarFillToday: {
    backgroundColor: '#1A594B',
  },
  weekLabel: {
    color: '#8A9692',
    fontSize: 9,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  weekLabelToday: {
    color: '#1A594B',
    fontWeight: '900',
  },
  statisticsGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 11,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flex: 1,
    paddingVertical: 14,
  },
  statValue: {
    color: '#174D42',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#687973',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
  },
  statHint: {
    color: '#9AA49F',
    fontSize: 8,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#E8F1EC',
    borderRadius: 18,
    marginTop: 15,
    padding: 16,
  },
  infoTitle: {
    color: '#23483E',
    fontSize: 12,
    fontWeight: '900',
  },
  infoText: {
    color: '#60756D',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  dataNotice: {
    color: '#84918D',
    fontSize: 10,
    lineHeight: 16,
    marginHorizontal: 15,
    marginTop: 18,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
