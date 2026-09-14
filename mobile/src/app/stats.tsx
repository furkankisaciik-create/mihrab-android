import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { getIstanbulDateKey, getNextDateKey } from '@/services/daily-content-date';
import {
  TRACKED_PRAYERS,
  getCompletedPrayerCount,
  loadPrayerTrackerState,
} from '@/services/prayer-tracker';
import type { PrayerTrackerState } from '@/types/prayer-tracker';

const TOTAL_PRAYERS = TRACKED_PRAYERS.length; // 5

function computeStats(state: PrayerTrackerState) {
  const today = getIstanbulDateKey();
  const days = state.days;

  // Last 30 days
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const key = getNextDateKey(today, i - 29);
    return { key, count: getCompletedPrayerCount(days[key]) };
  });

  // Last 7 days
  const last7 = last30.slice(-7);

  // Total completed prayers (all history)
  const totalPrayers = Object.values(days).reduce(
    (sum, day) => sum + getCompletedPrayerCount(day),
    0,
  );

  // This month
  const monthPrefix = today.slice(0, 7);
  const monthDays = Object.entries(days).filter(([k]) => k.startsWith(monthPrefix));
  const monthTotal = monthDays.reduce((s, [, d]) => s + getCompletedPrayerCount(d), 0);
  const daysInMonth = new Date().getDate();
  const monthPct = daysInMonth > 0 ? Math.round((monthTotal / (daysInMonth * TOTAL_PRAYERS)) * 100) : 0;

  // Current streak
  let streak = 0;
  let cursor =
    getCompletedPrayerCount(days[today]) === TOTAL_PRAYERS
      ? today
      : getNextDateKey(today, -1);
  while (getCompletedPrayerCount(days[cursor]) === TOTAL_PRAYERS) {
    streak += 1;
    cursor = getNextDateKey(cursor, -1);
  }

  // Best streak
  const sortedKeys = Object.keys(days).sort();
  let bestStreak = 0;
  let current = 0;
  let prevKey: string | null = null;
  for (const key of sortedKeys) {
    const isFull = getCompletedPrayerCount(days[key]) === TOTAL_PRAYERS;
    if (isFull) {
      const isNext =
        prevKey === null || getNextDateKey(prevKey, 1) === key;
      current = isNext ? current + 1 : 1;
      if (current > bestStreak) bestStreak = current;
    } else {
      current = 0;
    }
    prevKey = key;
  }

  // Per-prayer stats (last 30 days)
  const prayerCounts: Record<string, number> = {};
  for (const prayer of TRACKED_PRAYERS) {
    let count = 0;
    for (const { key } of last30) {
      if (days[key]?.prayers[prayer.key]) count++;
    }
    prayerCounts[prayer.key] = count;
  }

  return { last30, last7, totalPrayers, monthPct, streak, bestStreak, prayerCounts };
}

function StatCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      {unit && <Text style={[styles.statUnit, accent && styles.statUnitAccent]}>{unit}</Text>}
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

function HeatCell({ count }: { count: number }) {
  const opacity =
    count === 0 ? 0 : count === 1 ? 0.2 : count === 2 ? 0.4 : count === 3 ? 0.6 : count === 4 ? 0.8 : 1;
  return (
    <View
      style={[
        styles.heatCell,
        { backgroundColor: count === 0 ? 'rgba(255,255,255,0.06)' : `rgba(113,200,155,${opacity})` },
      ]}
    />
  );
}

export default function StatsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState<ReturnType<typeof computeStats> | null>(null);

  useEffect(() => {
    loadPrayerTrackerState().then((state) => setStats(computeStats(state)));
  }, []);

  if (!stats) return <View style={styles.screen} />;

  const maxBar = Math.max(...stats.last7.map((d) => d.count), 1);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('stats.title')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary grid */}
          <View style={styles.grid}>
            <StatCard label={t('stats.currentStreak')} value={stats.streak} unit={t('stats.days')} accent />
            <StatCard label={t('stats.bestStreak')} value={stats.bestStreak} unit={t('stats.days')} />
            <StatCard label={t('stats.thisMonth')} value={`${stats.monthPct}%`} />
            <StatCard label={t('stats.totalPrayers')} value={stats.totalPrayers} />
          </View>

          {/* 7-day bar chart */}
          <Text style={styles.sectionTitle}>{t('stats.last7days')}</Text>
          <View style={styles.barCard}>
            <View style={styles.bars}>
              {stats.last7.map(({ key, count }) => {
                const day = new Date(`${key}T12:00:00Z`).toLocaleDateString('tr-TR', { weekday: 'short' });
                const pct = (count / maxBar) * 100;
                return (
                  <View key={key} style={styles.barWrap}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${pct}%` as `${number}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{count}</Text>
                    <Text style={styles.barDay}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 30-day heatmap */}
          <Text style={styles.sectionTitle}>{t('stats.last30days')}</Text>
          <View style={styles.heatCard}>
            <View style={styles.heatGrid}>
              {stats.last30.map(({ key, count }) => (
                <HeatCell key={key} count={count} />
              ))}
            </View>
            <View style={styles.heatLegend}>
              <Text style={styles.heatLegendText}>0</Text>
              <View style={styles.heatLegendDots}>
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <HeatCell key={v} count={v} />
                ))}
              </View>
              <Text style={styles.heatLegendText}>5</Text>
            </View>
          </View>

          {/* Per-prayer breakdown */}
          <Text style={styles.sectionTitle}>{t('stats.perPrayer')}</Text>
          <View style={styles.prayerCard}>
            {TRACKED_PRAYERS.map((prayer) => {
              const count = stats.prayerCounts[prayer.key] ?? 0;
              const pct = Math.round((count / 30) * 100);
              return (
                <View key={prayer.key} style={styles.prayerRow}>
                  <Text style={styles.prayerSymbol}>{prayer.symbol}</Text>
                  <View style={styles.prayerInfo}>
                    <View style={styles.prayerLabelRow}>
                      <Text style={styles.prayerName}>{prayer.name}</Text>
                      <Text style={styles.prayerPct}>{pct}%</Text>
                    </View>
                    <View style={styles.prayerTrack}>
                      <View style={[styles.prayerFill, { width: `${pct}%` as `${number}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
            <Text style={styles.prayerNote}>{t('stats.last30note')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0D2918' },
  safeArea: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backText: { color: '#FFFFFF', fontSize: 28, lineHeight: 32 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  content: { paddingBottom: 120, paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCard: {
    backgroundColor: '#1A3D30',
    borderRadius: 18,
    flex: 1,
    minWidth: '44%',
    padding: 18,
  },
  statCardAccent: { backgroundColor: '#1D6555' },
  statValue: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  statValueAccent: { color: '#F1CF82' },
  statUnit: { color: '#7BA89E', fontSize: 11, marginTop: 1 },
  statUnitAccent: { color: '#A8D4C0' },
  statLabel: { color: '#5E8E7A', fontSize: 11, fontWeight: '700', marginTop: 8 },
  statLabelAccent: { color: '#A8D4C0' },
  sectionTitle: {
    color: '#7BA89E',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 12,
    marginTop: 26,
  },
  barCard: { backgroundColor: '#1A3D30', borderRadius: 18, padding: 18 },
  bars: { flexDirection: 'row', gap: 8, height: 120, alignItems: 'flex-end' },
  barWrap: { alignItems: 'center', flex: 1 },
  barTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  barFill: { backgroundColor: '#71C89B', borderRadius: 6, width: '100%' },
  barLabel: { color: '#7BA89E', fontSize: 10, fontWeight: '700', marginTop: 4 },
  barDay: { color: '#4A6B5E', fontSize: 9, marginTop: 2 },
  heatCard: { backgroundColor: '#1A3D30', borderRadius: 18, padding: 18 },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  heatCell: { borderRadius: 4, height: 18, width: 18 },
  heatLegend: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 12 },
  heatLegendText: { color: '#4A6B5E', fontSize: 10 },
  heatLegendDots: { flexDirection: 'row', gap: 4 },
  prayerCard: { backgroundColor: '#1A3D30', borderRadius: 18, padding: 18 },
  prayerRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 16 },
  prayerSymbol: { color: '#71C89B', fontSize: 18, marginRight: 12, width: 24 },
  prayerInfo: { flex: 1 },
  prayerLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  prayerName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  prayerPct: { color: '#71C89B', fontSize: 12, fontWeight: '800' },
  prayerTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    height: 6,
    overflow: 'hidden',
  },
  prayerFill: { backgroundColor: '#71C89B', borderRadius: 6, height: '100%' },
  prayerNote: { color: '#3D5E52', fontSize: 10, marginTop: 6 },
});
