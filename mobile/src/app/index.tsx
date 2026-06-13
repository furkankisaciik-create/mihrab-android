import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import { DailyHadithPreview } from '@/components/daily-hadith-preview';
import { DailyVersePreview } from '@/components/daily-verse-preview';
import { DhikrPreview } from '@/components/dhikr-preview';
import { DuaLibraryPreview } from '@/components/dua-library-preview';
import { HijriCalendarPreview } from '@/components/hijri-calendar-preview';
import { HomeWidgetPreview } from '@/components/home-widget-preview';
import { LocationSelector } from '@/components/location-selector';
import { NearbyMosquesPreview } from '@/components/nearby-mosques-preview';
import { PrayerTrackerPreview } from '@/components/prayer-tracker-preview';
import { QadaTrackerPreview } from '@/components/qada-tracker-preview';
import { QuranPreview } from '@/components/quran-preview';
import { RamadanPreview } from '@/components/ramadan-preview';
import { ReligiousDaysPreview } from '@/components/religious-days-preview';
import { SilentModePreview } from '@/components/silent-mode-preview';
import { usePrayerTimes } from '@/hooks/use-prayer-times';
import type { PrayerTime } from '@/types/prayer';

const EMPTY_PRAYERS: PrayerTime[] = [
  { key: 'imsak', name: 'İmsak', time: '--:--', symbol: '☾' },
  { key: 'gunes', name: 'Güneş', time: '--:--', symbol: '☀' },
  { key: 'ogle', name: 'Öğle', time: '--:--', symbol: '◉' },
  { key: 'ikindi', name: 'İkindi', time: '--:--', symbol: '◒' },
  { key: 'aksam', name: 'Akşam', time: '--:--', symbol: '◐' },
  { key: 'yatsi', name: 'Yatsı', time: '--:--', symbol: '☽' },
];

function getPrayerDate(prayer: PrayerTime, now: Date, tomorrow = false) {
  const [hours, minutes] = prayer.time.split(':').map(Number);
  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);
  if (tomorrow) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function getNextPrayer(prayers: PrayerTime[], now: Date) {
  const validPrayers = prayers.filter((prayer) => /^\d{2}:\d{2}$/.test(prayer.time));
  const nextToday = validPrayers.find((prayer) => getPrayerDate(prayer, now) > now);

  if (nextToday) {
    return { prayer: nextToday, date: getPrayerDate(nextToday, now) };
  }

  if (validPrayers[0]) {
    return {
      prayer: validPrayers[0],
      date: getPrayerDate(validPrayers[0], now, true),
    };
  }

  return null;
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatLocation(city?: string, district?: string) {
  if (!city) {
    return 'Konum belirleniyor';
  }
  if (!district || city === district) {
    return city;
  }
  return `${district}, ${city}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [selectorVisible, setSelectorVisible] = useState(false);
  const {
    snapshot,
    loading,
    refreshing,
    error,
    notice,
    refreshFromDevice,
    refreshCurrent,
    selectLocation,
    getCities,
    getDistricts,
  } = usePrayerTimes();
  const prayers = snapshot?.prayers ?? EMPTY_PRAYERS;
  const nextPrayer = useMemo(() => getNextPrayer(prayers, now), [now, prayers]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const locationLabel = formatLocation(
    snapshot?.location.city.name,
    snapshot?.location.district.name,
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshCurrent}
            tintColor="#FFFFFF"
          />
        }>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.locationCopy}>
                <Text style={styles.eyebrow}>DİYANET NAMAZ VAKİTLERİ</Text>
                <Text numberOfLines={1} style={styles.location}>
                  {locationLabel}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="İl ve ilçe seç"
                onPress={() => setSelectorVisible(true)}
                style={styles.locationButton}>
                <Text style={styles.locationButtonIcon}>⌖</Text>
              </Pressable>
            </View>

            <View style={styles.nextPrayer}>
              {loading && !snapshot ? (
                <>
                  <ActivityIndicator color="#F1CF82" size="large" />
                  <Text style={styles.loadingText}>Konum ve vakitler alınıyor</Text>
                </>
              ) : nextPrayer ? (
                <>
                  <Text style={styles.nextPrayerLabel}>Sıradaki vakit</Text>
                  <Text style={styles.nextPrayerName}>{nextPrayer.prayer.name}</Text>
                  <Text style={styles.countdown}>
                    {formatRemaining(nextPrayer.date.getTime() - now.getTime())}
                  </Text>
                  <Text style={styles.nextPrayerTime}>{nextPrayer.prayer.time}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.nextPrayerLabel}>Vakit bilgisi bekleniyor</Text>
                  <Text style={styles.nextPrayerName}>--:--</Text>
                </>
              )}
            </View>

            <View style={styles.heroFooter}>
              <Text style={styles.heroFooterText}>
                {snapshot?.gregorianDate || 'Türkiye için otomatik konum'}
              </Text>
              <Text style={styles.heroFooterText}>{snapshot?.hijriDate || 'Diyanet kaynağı'}</Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          {error && !snapshot && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Vakitler alınamadı</Text>
              <Text style={styles.errorText}>{error}</Text>
              <View style={styles.errorActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={refreshFromDevice}
                  style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Tekrar dene</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelectorVisible(true)}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Elle seç</Text>
                </Pressable>
              </View>
            </View>
          )}

          {notice && (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          )}

          <HijriCalendarPreview snapshot={snapshot} />
          <ReligiousDaysPreview />
          <RamadanPreview snapshot={snapshot} />
          <NearbyMosquesPreview />
          <SilentModePreview />
          <HomeWidgetPreview />
          <DailyVersePreview />
          <DailyHadithPreview />
          <DhikrPreview />
          <PrayerTrackerPreview />
          <QadaTrackerPreview />
          <DuaLibraryPreview />
          <QuranPreview />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bugünün vakitleri</Text>
            <View style={styles.sourceBadge}>
              <View style={[styles.sourceDot, snapshot?.isCached && styles.sourceDotCached]} />
              <Text style={styles.calculationLabel}>
                {snapshot?.isCached ? 'Kayıtlı Diyanet' : 'Diyanet'}
              </Text>
            </View>
          </View>

          <View style={styles.prayerCard}>
            {prayers.map((prayer, index) => {
              const isNext = prayer.key === nextPrayer?.prayer.key;
              return (
                <View
                  key={prayer.key}
                  style={[
                    styles.prayerRow,
                    index !== prayers.length - 1 && styles.prayerRowBorder,
                    isNext && styles.activePrayerRow,
                  ]}>
                  <View style={[styles.prayerSymbol, isNext && styles.activePrayerSymbol]}>
                    <Text style={[styles.prayerSymbolText, isNext && styles.activePrayerSymbolText]}>
                      {prayer.symbol}
                    </Text>
                  </View>
                  <Text style={[styles.prayerName, isNext && styles.activePrayerText]}>
                    {prayer.name}
                  </Text>
                  {isNext && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextBadgeText}>SIRADA</Text>
                    </View>
                  )}
                  <Text style={[styles.prayerTime, isNext && styles.activePrayerText]}>
                    {prayer.time}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.quickActions}>
            <Pressable
              accessibilityRole="button"
              onPress={refreshFromDevice}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>⌖</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Konumu yenile</Text>
                <Text style={styles.actionSubtitle}>Telefon konumundan il ve ilçeyi belirle</Text>
              </View>
              {refreshing ? (
                <ActivityIndicator color="#1A594B" />
              ) : (
                <Text style={styles.chevron}>›</Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectorVisible(true)}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>▤</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>İl veya ilçe seç</Text>
                <Text style={styles.actionSubtitle}>Türkiye’deki Diyanet bölgelerini listele</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/qibla')}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>⌁</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Kıble pusulası</Text>
                <Text style={styles.actionSubtitle}>Cihaz sensörleriyle Kâbe yönünü canlı bul</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/notifications')}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>♢</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Vakit bildirimleri</Text>
                <Text style={styles.actionSubtitle}>Her vakit için ayrı hatırlatma ve ses ayarı</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/mosques' as Href)}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>⌖</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Yakındaki camiler</Text>
                <Text style={styles.actionSubtitle}>
                  Haritada camileri, mesafeyi ve yol tarifini gör
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/silent-mode' as Href)}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>☾</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Otomatik sessiz mod</Text>
                <Text style={styles.actionSubtitle}>
                  Namaz vakitlerine göre sessiz zamanlarını planla
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/home-widget' as Href)}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>W</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Ana ekran widget&apos;Ä±</Text>
                <Text style={styles.actionSubtitle}>
                  SÄ±radaki vakti telefon ana ekranÄ±nda gÃ¶ster
                </Text>
              </View>
              <Text style={styles.chevron}>â€º</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/explore')}
              style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>P</Text>
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Yol haritası</Text>
                <Text style={styles.actionSubtitle}>MIHRAB hedeflerinde nerede olduğumuzu gör</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          <Text style={styles.dataNotice}>
            Vakitler Diyanet İşleri Başkanlığının resmî namaz vakitleri sayfasından alınır. Son
            başarılı veri çevrimdışı kullanım için bu cihazda saklanır.
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
    flex: 1,
    backgroundColor: '#F3F6F2',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: '#123E36',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  safeArea: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  locationCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: '#9EC2B3',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  location: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    marginTop: 3,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonIcon: {
    color: '#FFFFFF',
    fontSize: 23,
  },
  nextPrayer: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    color: '#C3D7CF',
    fontSize: 13,
    marginTop: 14,
  },
  nextPrayerLabel: {
    color: '#A9C8BC',
    fontSize: 13,
    fontWeight: '600',
  },
  nextPrayerName: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
    marginTop: 8,
  },
  countdown: {
    color: '#F1CF82',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginTop: 8,
  },
  nextPrayerTime: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 5,
  },
  heroFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 16,
  },
  heroFooterText: {
    color: '#C4D8D0',
    flexShrink: 1,
    fontSize: 11,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  errorCard: {
    backgroundColor: '#FFF4F1',
    borderColor: '#F0D1C9',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  errorTitle: {
    color: '#71352D',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#875249',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryButton: {
    backgroundColor: '#1A594B',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryButton: {
    borderColor: '#1A594B',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#1A594B',
    fontSize: 12,
    fontWeight: '800',
  },
  noticeCard: {
    backgroundColor: '#FFF7DF',
    borderRadius: 14,
    marginBottom: 16,
    padding: 13,
  },
  noticeText: {
    color: '#715E2C',
    fontSize: 11,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    color: '#182723',
    fontSize: 20,
    fontWeight: '700',
  },
  sourceBadge: {
    backgroundColor: '#E4ECE8',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A806C',
  },
  sourceDotCached: {
    backgroundColor: '#C39A42',
  },
  calculationLabel: {
    color: '#557169',
    fontSize: 11,
    fontWeight: '700',
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#193B31',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  prayerRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  prayerRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9EEEB',
  },
  activePrayerRow: {
    backgroundColor: '#EFF7F2',
  },
  prayerSymbol: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  activePrayerSymbol: {
    backgroundColor: '#1A594B',
  },
  prayerSymbolText: {
    color: '#5C7069',
    fontSize: 16,
  },
  activePrayerSymbolText: {
    color: '#FFFFFF',
  },
  prayerName: {
    color: '#25332F',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  prayerTime: {
    color: '#34463F',
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  activePrayerText: {
    color: '#154E42',
  },
  nextBadge: {
    backgroundColor: '#D8EADF',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginRight: 12,
  },
  nextBadgeText: {
    color: '#1A594B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  quickActions: {
    gap: 12,
    marginTop: 20,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E8EFEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionIconText: {
    color: '#1A594B',
    fontSize: 20,
    fontWeight: '700',
  },
  actionCopy: {
    flex: 1,
    paddingRight: 8,
  },
  actionTitle: {
    color: '#23332E',
    fontSize: 15,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: '#73827D',
    fontSize: 12,
    marginTop: 3,
  },
  chevron: {
    color: '#80918B',
    fontSize: 28,
  },
  dataNotice: {
    color: '#84918D',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginHorizontal: 15,
    marginTop: 20,
  },
});
