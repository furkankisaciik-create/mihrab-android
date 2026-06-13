import { useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { MosqueMap } from '@/components/mosque-map';
import { useNearbyMosques } from '@/hooks/use-nearby-mosques';
import { formatMosqueDistance } from '@/services/mosques';
import { getCompassDirection } from '@/services/qibla';
import type { NearbyMosque } from '@/types/mosque';

const RADIUS_OPTIONS = [
  { label: '2 km', value: 2000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
] as const;

function getWheelchairLabel(value: NearbyMosque['wheelchair']) {
  if (value === 'yes') return 'Engelsiz erişim';
  if (value === 'limited') return 'Kısmi erişim';
  if (value === 'no') return 'Engelsiz erişim yok';
  return null;
}

async function openDirections(mosque: NearbyMosque) {
  const destination = `${mosque.latitude},${mosque.longitude}`;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destination}&dirflg=w`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
  await Linking.openURL(url);
}

export default function NearbyMosquesScreen() {
  const router = useRouter();
  const {
    status,
    snapshot,
    selectedMosqueId,
    selectedMosque,
    radiusMeters,
    error,
    refreshing,
    refresh,
    selectMosque,
  } = useNearbyMosques();
  const resultsLabel = useMemo(() => {
    if (!snapshot) return 'Konum hazırlanıyor';
    return `${snapshot.mosques.length} cami · ${radiusMeters / 1000} km çevre`;
  }, [radiusMeters, snapshot]);
  const selectedMosqueNumber = Math.max(
    1,
    (snapshot?.mosques.findIndex(
      (mosque) => mosque.id === selectedMosqueId,
    ) ?? 0) + 1,
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
                accessibilityLabel="Yakındaki camileri yenile"
                accessibilityRole="button"
                disabled={refreshing}
                onPress={() => void refresh()}
                style={styles.heroButton}>
                {refreshing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.heroButtonText}>Yenile</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · KONUM ARAÇLARI</Text>
            <Text style={styles.heroTitle}>Yakındaki camiler</Text>
            <Text style={styles.heroSubtitle}>
              Konumuna en yakın camileri haritada gör, mesafeyi karşılaştır ve yol tarifini aç.
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>⌖</Text>
              </View>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryLabel}>ARAMA DURUMU</Text>
                <Text style={styles.summaryTitle}>{resultsLabel}</Text>
                <Text style={styles.summarySubtitle}>
                  {snapshot?.isCached
                    ? 'Kayıtlı sonuçlar gösteriliyor, güncel konum aranıyor'
                    : 'OpenStreetMap topluluk verisi'}
                </Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                  {snapshot?.isCached ? 'KAYITLI' : 'CANLI'}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.radiusHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>ARAMA ALANI</Text>
              <Text style={styles.sectionTitle}>Mesafeyi seç</Text>
            </View>
            <Text style={styles.accuracyText}>
              {snapshot?.origin.accuracy
                ? `Konum ±${Math.round(snapshot.origin.accuracy)} m`
                : 'GPS konumu'}
            </Text>
          </View>

          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((option) => {
              const active = radiusMeters === option.value;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={option.value}
                  onPress={() => void refresh(option.value)}
                  style={[
                    styles.radiusButton,
                    active && styles.radiusButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.radiusButtonText,
                      active && styles.radiusButtonTextActive,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {snapshot ? (
            <View style={styles.mapCard}>
              <MosqueMap
                mosques={snapshot.mosques}
                onSelectMosque={selectMosque}
                origin={snapshot.origin}
                radiusMeters={radiusMeters}
                selectedMosqueId={selectedMosqueId}
              />
              {refreshing ? (
                <View style={styles.mapLoading}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.mapLoadingText}>Konum güncelleniyor</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.loadingCard}>
              {status === 'loading' ? (
                <>
                  <ActivityIndicator color="#1A594B" size="large" />
                  <Text style={styles.loadingTitle}>Yakındaki camiler aranıyor</Text>
                  <Text style={styles.loadingText}>
                    GPS konumu ve harita verisi hazırlanıyor.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.errorIcon}>⌖</Text>
                  <Text style={styles.loadingTitle}>Harita açılamadı</Text>
                  <Text style={styles.loadingText}>{error}</Text>
                  <View style={styles.errorActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void refresh()}
                      style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Tekrar dene</Text>
                    </Pressable>
                    {status === 'permission-denied' ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void Linking.openSettings()}
                        style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Ayarları aç</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </>
              )}
            </View>
          )}

          {error && snapshot ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{error}</Text>
            </View>
          ) : null}

          {selectedMosque ? (
            <View style={styles.selectedCard}>
              <View style={styles.selectedTop}>
                <View style={styles.selectedNumber}>
                  <Text style={styles.selectedNumberText}>
                    {selectedMosqueNumber}
                  </Text>
                </View>
                <View style={styles.selectedCopy}>
                  <Text style={styles.selectedLabel}>SEÇİLİ CAMİ</Text>
                  <Text style={styles.selectedTitle}>{selectedMosque.name}</Text>
                  <Text style={styles.selectedMeta}>
                    {formatMosqueDistance(selectedMosque.distanceKm)} ·{' '}
                    {getCompassDirection(selectedMosque.bearing)} yönü
                  </Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>
                    {formatMosqueDistance(selectedMosque.distanceKm)}
                  </Text>
                </View>
              </View>

              {selectedMosque.address ? (
                <Text style={styles.selectedAddress}>{selectedMosque.address}</Text>
              ) : null}

              <View style={styles.selectedActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void openDirections(selectedMosque)}
                  style={styles.directionsButton}>
                  <Text style={styles.directionsButtonText}>Yol tarifi</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => void Linking.openURL(selectedMosque.osmUrl)}
                  style={styles.mapLinkButton}>
                  <Text style={styles.mapLinkText}>Haritada aç</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {snapshot?.mosques.length ? (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>Mesafeye göre camiler</Text>
                <Text style={styles.listCount}>{snapshot.mosques.length} sonuç</Text>
              </View>

              <View style={styles.listCard}>
                {snapshot.mosques.map((mosque, index) => {
                  const selected = mosque.id === selectedMosqueId;
                  const wheelchairLabel = getWheelchairLabel(mosque.wheelchair);
                  return (
                    <Pressable
                      accessibilityLabel={`${mosque.name}, ${formatMosqueDistance(mosque.distanceKm)}`}
                      accessibilityRole="button"
                      key={mosque.id}
                      onPress={() => selectMosque(mosque.id)}
                      style={[
                        styles.mosqueRow,
                        index !== snapshot.mosques.length - 1 &&
                          styles.mosqueRowBorder,
                        selected && styles.mosqueRowSelected,
                      ]}>
                      <View
                        style={[
                          styles.rowNumber,
                          selected && styles.rowNumberSelected,
                        ]}>
                        <Text
                          style={[
                            styles.rowNumberText,
                            selected && styles.rowNumberTextSelected,
                          ]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.rowCopy}>
                        <Text numberOfLines={1} style={styles.rowTitle}>
                          {mosque.name}
                        </Text>
                        <Text numberOfLines={1} style={styles.rowSubtitle}>
                          {mosque.address ||
                            wheelchairLabel ||
                            `${mosque.category} · OpenStreetMap kaydı`}
                        </Text>
                      </View>
                      <View style={styles.rowDistance}>
                        <Text style={styles.rowDistanceValue}>
                          {formatMosqueDistance(mosque.distanceKm)}
                        </Text>
                        <Text style={styles.rowDirection}>
                          {getCompassDirection(mosque.bearing)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <Text style={styles.dataNotice}>
            Cami konumları OpenStreetMap topluluk verisinden alınır. Eksik veya hatalı kayıtlar
            olabilir; yolculuk öncesi seçilen konumu kontrol edin.
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
  scrollContent: {
    paddingBottom: 125,
  },
  hero: {
    backgroundColor: '#123E36',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  heroButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 62,
    paddingHorizontal: 12,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#F1CF82',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 25,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 6,
  },
  heroSubtitle: {
    color: '#BBD0C8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 520,
  },
  summaryRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 22,
    padding: 13,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: '#F1CF82',
    borderRadius: 15,
    height: 46,
    justifyContent: 'center',
    marginRight: 11,
    width: 46,
  },
  summaryIconText: {
    color: '#123E36',
    fontSize: 22,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryLabel: {
    color: '#91B5A8',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },
  summarySubtitle: {
    color: '#AFC9C0',
    fontSize: 9,
    marginTop: 3,
  },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  liveDot: {
    backgroundColor: '#73D2A7',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  liveText: {
    color: '#DDECE6',
    fontSize: 7,
    fontWeight: '900',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  radiusHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionEyebrow: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: '#20312B',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },
  accuracyText: {
    color: '#7B8B85',
    fontSize: 10,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  radiusButton: {
    alignItems: 'center',
    backgroundColor: '#E5ECE8',
    borderRadius: 13,
    flex: 1,
    paddingVertical: 11,
  },
  radiusButtonActive: {
    backgroundColor: '#1A594B',
  },
  radiusButtonText: {
    color: '#5D7069',
    fontSize: 12,
    fontWeight: '800',
  },
  radiusButtonTextActive: {
    color: '#FFFFFF',
  },
  mapCard: {
    backgroundColor: '#DCE9E2',
    borderColor: '#D4DFD9',
    borderRadius: 24,
    borderWidth: 1,
    height: 320,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapLoading: {
    alignItems: 'center',
    backgroundColor: 'rgba(18,62,54,0.86)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    left: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    position: 'absolute',
    top: 12,
  },
  mapLoadingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 260,
    padding: 25,
  },
  loadingTitle: {
    color: '#253730',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 13,
    textAlign: 'center',
  },
  loadingText: {
    color: '#75847F',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    textAlign: 'center',
  },
  errorIcon: {
    color: '#1A594B',
    fontSize: 30,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },
  primaryButton: {
    backgroundColor: '#1A594B',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
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
    fontSize: 11,
    fontWeight: '900',
  },
  noticeCard: {
    backgroundColor: '#FFF4E4',
    borderRadius: 14,
    marginTop: 12,
    padding: 12,
  },
  noticeText: {
    color: '#7B5C2B',
    fontSize: 10,
    lineHeight: 16,
  },
  selectedCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE6E1',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 14,
    padding: 15,
  },
  selectedTop: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  selectedNumber: {
    alignItems: 'center',
    backgroundColor: '#C28A2E',
    borderRadius: 15,
    height: 31,
    justifyContent: 'center',
    marginRight: 10,
    width: 31,
  },
  selectedNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  selectedCopy: {
    flex: 1,
  },
  selectedLabel: {
    color: '#A0732E',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  selectedTitle: {
    color: '#22342E',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },
  selectedMeta: {
    color: '#71817B',
    fontSize: 9,
    marginTop: 3,
  },
  distanceBadge: {
    backgroundColor: '#E8F1EC',
    borderRadius: 12,
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  distanceBadgeText: {
    color: '#1A594B',
    fontSize: 10,
    fontWeight: '900',
  },
  selectedAddress: {
    color: '#65766F',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 11,
  },
  selectedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  directionsButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 13,
    flex: 1,
    paddingVertical: 11,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  mapLinkButton: {
    alignItems: 'center',
    borderColor: '#1A594B',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 11,
  },
  mapLinkText: {
    color: '#1A594B',
    fontSize: 11,
    fontWeight: '900',
  },
  listHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  listCount: {
    color: '#83908C',
    fontSize: 10,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 12,
    overflow: 'hidden',
  },
  mosqueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: 13,
  },
  mosqueRowBorder: {
    borderBottomColor: '#E8EEEA',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mosqueRowSelected: {
    backgroundColor: '#F3F8F5',
  },
  rowNumber: {
    alignItems: 'center',
    backgroundColor: '#ECF0EE',
    borderRadius: 13,
    height: 27,
    justifyContent: 'center',
    marginRight: 10,
    width: 27,
  },
  rowNumberSelected: {
    backgroundColor: '#1A594B',
  },
  rowNumberText: {
    color: '#697771',
    fontSize: 9,
    fontWeight: '900',
  },
  rowNumberTextSelected: {
    color: '#FFFFFF',
  },
  rowCopy: {
    flex: 1,
    paddingRight: 9,
  },
  rowTitle: {
    color: '#2A3A35',
    fontSize: 13,
    fontWeight: '800',
  },
  rowSubtitle: {
    color: '#85918D',
    fontSize: 9,
    marginTop: 4,
  },
  rowDistance: {
    alignItems: 'flex-end',
  },
  rowDistanceValue: {
    color: '#1A594B',
    fontSize: 11,
    fontWeight: '900',
  },
  rowDirection: {
    color: '#89958F',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 4,
  },
  dataNotice: {
    color: '#81908A',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 20,
    textAlign: 'center',
  },
});
