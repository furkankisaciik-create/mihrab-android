import { useMemo } from 'react';
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

import { useQiblaCompass } from '@/hooks/use-qibla-compass';
import {
  calculateTurnAngle,
  getCompassDirection,
} from '@/services/qibla';

const TICKS = Array.from({ length: 36 }, (_, index) => index * 10);
const ALIGNMENT_TOLERANCE = 3;

function getAccuracyLabel(accuracy: number) {
  if (accuracy >= 3) return { label: 'Yüksek', color: '#2C806D' };
  if (accuracy === 2) return { label: 'Orta', color: '#B18432' };
  if (accuracy === 1) return { label: 'Düşük', color: '#B7653C' };
  return { label: 'Kalibre edilmeli', color: '#A33F36' };
}

function formatDistance(distanceKm: number | null) {
  return distanceKm === null ? '--' : `${Math.round(distanceKm).toLocaleString('tr-TR')} km`;
}

export default function QiblaScreen() {
  const {
    status,
    qiblaBearing,
    heading,
    headingAccuracy,
    usesTrueNorth,
    distanceKm,
    locationAccuracy,
    error,
    refresh,
  } = useQiblaCompass();

  const turnAngle =
    qiblaBearing !== null && heading !== null
      ? calculateTurnAngle(qiblaBearing, heading)
      : null;
  const accuracy = getAccuracyLabel(headingAccuracy);
  const accuracyColor = status === 'web-preview' ? '#65756F' : accuracy.color;
  const isAligned =
    status === 'ready' &&
    turnAngle !== null &&
    Math.abs(turnAngle) <= ALIGNMENT_TOLERANCE &&
    headingAccuracy >= 2;
  const dialRotation = heading === null ? 0 : -heading;
  const displayBearing = qiblaBearing === null ? '--' : Math.round(qiblaBearing);
  const direction = qiblaBearing === null ? '--' : getCompassDirection(qiblaBearing);

  const guidance = useMemo(() => {
    if (status === 'web-preview') return 'Canlı pusula Android veya iOS cihazda çalışır';
    if (headingAccuracy < 2 && status === 'ready') {
      return 'Telefonu havada sekiz çizerek kalibre edin';
    }
    if (isAligned) return 'Kıble hizasındasınız';
    if (turnAngle === null) return 'Kıble yönü hazırlanıyor';
    const amount = Math.max(1, Math.round(Math.abs(turnAngle)));
    return turnAngle > 0 ? `Sağa ${amount}° dönün` : `Sola ${amount}° dönün`;
  }, [headingAccuracy, isAligned, status, turnAngle]);

  const isLoading = status === 'loading';
  const canShowCompass =
    qiblaBearing !== null && heading !== null && status !== 'permission-denied';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, isAligned && styles.heroAligned]}>
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <Text style={styles.eyebrow}>CANLI KIBLE PUSULASI</Text>
            <Text style={styles.title}>Kâbe yönü</Text>
            <Text style={styles.subtitle}>Telefonu yere paralel ve düz tutun</Text>

            {isLoading ? (
              <View style={styles.loadingArea}>
                <ActivityIndicator color="#F1CF82" size="large" />
                <Text style={styles.loadingText}>Konum ve pusula hazırlanıyor</Text>
              </View>
            ) : canShowCompass ? (
              <>
                <View
                  accessible
                  accessibilityLabel={`Kıble yönü ${displayBearing} derece ${direction}`}
                  style={styles.compassWrapper}>
                  <View style={styles.fixedIndicator} />
                  <View
                    style={[
                      styles.compass,
                      isAligned && styles.compassAligned,
                      { transform: [{ rotate: `${dialRotation}deg` }] },
                    ]}>
                    {TICKS.map((angle) => (
                      <View
                        key={angle}
                        style={[styles.tickLayer, { transform: [{ rotate: `${angle}deg` }] }]}>
                        <View
                          style={[
                            styles.tick,
                            angle % 90 === 0 && styles.cardinalTick,
                            angle === 0 && styles.northTick,
                          ]}
                        />
                      </View>
                    ))}

                    <Text style={[styles.cardinal, styles.north]}>K</Text>
                    <Text style={[styles.cardinal, styles.east]}>D</Text>
                    <Text style={[styles.cardinal, styles.south]}>G</Text>
                    <Text style={[styles.cardinal, styles.west]}>B</Text>

                    <View
                      style={[
                        styles.qiblaLayer,
                        { transform: [{ rotate: `${qiblaBearing}deg` }] },
                      ]}>
                      <View style={styles.qiblaArrow}>
                        <View style={styles.qiblaArrowHead} />
                        <View style={styles.qiblaLine} />
                      </View>
                    </View>
                  </View>

                  <View style={[styles.kaaba, isAligned && styles.kaabaAligned]}>
                    <View style={styles.kaabaBand} />
                    <View style={styles.kaabaDoor} />
                  </View>
                </View>

                <View style={[styles.guidancePill, isAligned && styles.guidancePillAligned]}>
                  <View style={[styles.guidanceDot, isAligned && styles.guidanceDotAligned]} />
                  <Text style={[styles.guidanceText, isAligned && styles.guidanceTextAligned]}>
                    {guidance}
                  </Text>
                </View>

                <View style={styles.bearingRow}>
                  <View style={styles.bearingItem}>
                    <Text style={styles.bearingValue}>{displayBearing}°</Text>
                    <Text style={styles.bearingLabel}>Kıble azimutu</Text>
                  </View>
                  <View style={styles.bearingDivider} />
                  <View style={styles.bearingItem}>
                    <Text style={styles.bearingValue}>{direction}</Text>
                    <Text style={styles.bearingLabel}>Pusula yönü</Text>
                  </View>
                  <View style={styles.bearingDivider} />
                  <View style={styles.bearingItem}>
                    <Text style={styles.bearingValue}>{formatDistance(distanceKm)}</Text>
                    <Text style={styles.bearingLabel}>Kâbe mesafesi</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.errorArea}>
                <Text style={styles.errorIcon}>⌖</Text>
                <Text style={styles.errorTitle}>Pusula başlatılamadı</Text>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.errorActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void refresh()}
                    style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Tekrar dene</Text>
                  </Pressable>
                  {status === 'permission-denied' && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void Linking.openSettings()}
                      style={styles.settingsButton}>
                      <Text style={styles.settingsButtonText}>Ayarları aç</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Doğruluk durumu</Text>
            {status === 'ready' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>CANLI</Text>
              </View>
            )}
          </View>

          <View style={styles.accuracyCard}>
            <View style={styles.accuracyRow}>
              <View>
                <Text style={styles.accuracyTitle}>Pusula doğruluğu</Text>
                <Text style={[styles.accuracyValue, { color: accuracyColor }]}>
                  {status === 'web-preview' ? 'Telefonda ölçülür' : accuracy.label}
                </Text>
              </View>
              <View style={styles.accuracyBars}>
                {[1, 2, 3].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.accuracyBar,
                      {
                        height: 8 + level * 6,
                        backgroundColor:
                          headingAccuracy >= level ? accuracyColor : '#DCE4E0',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kuzey referansı</Text>
              <Text style={styles.detailValue}>
                {status === 'web-preview'
                  ? 'Telefonda belirlenir'
                  : usesTrueNorth
                    ? 'Gerçek kuzey'
                    : 'Manyetik kuzey'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Konum doğruluğu</Text>
              <Text style={styles.detailValue}>
                {locationAccuracy === null ? '--' : `yaklaşık ±${Math.round(locationAccuracy)} m`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hesaplama</Text>
              <Text style={styles.detailValue}>Büyük çember azimutu</Text>
            </View>
          </View>

          {status === 'ready' && headingAccuracy < 2 && (
            <View style={styles.calibrationCard}>
              <View style={styles.calibrationIcon}>
                <Text style={styles.calibrationIconText}>∞</Text>
              </View>
              <View style={styles.calibrationCopy}>
                <Text style={styles.calibrationTitle}>Pusulayı kalibre edin</Text>
                <Text style={styles.calibrationText}>
                  Telefonu metal eşyalardan uzaklaştırın ve havada birkaç kez sekiz çizin.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>En doğru sonuç için</Text>
            <Text style={styles.tipText}>
              Manyetik kapak, araç içi, hoparlör, metal masa ve elektronik cihazlar pusulayı
              etkileyebilir. Açık bir alanda telefonu yatay tutarak ölçüm yapın.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => void refresh()}
            style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Konumu ve pusulayı yenile</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6F2' },
  scrollContent: { paddingBottom: 120 },
  hero: {
    backgroundColor: '#123E36',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  heroAligned: { backgroundColor: '#164D40' },
  heroSafeArea: {
    alignItems: 'center',
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  eyebrow: { color: '#9DC7B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 7 },
  subtitle: { color: '#B8D0C8', fontSize: 12, marginTop: 5 },
  loadingArea: { alignItems: 'center', height: 390, justifyContent: 'center' },
  loadingText: { color: '#C5D9D2', fontSize: 13, marginTop: 14 },
  compassWrapper: {
    alignItems: 'center',
    height: 292,
    justifyContent: 'center',
    marginTop: 18,
    width: 292,
  },
  compass: {
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 136,
    borderWidth: 1,
    height: 272,
    position: 'absolute',
    width: 272,
  },
  compassAligned: { borderColor: '#F1CF82', borderWidth: 2 },
  fixedIndicator: {
    borderBottomColor: '#F1CF82',
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderLeftWidth: 8,
    borderRightColor: 'transparent',
    borderRightWidth: 8,
    height: 0,
    position: 'absolute',
    top: 0,
    width: 0,
    zIndex: 5,
  },
  tickLayer: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tick: {
    backgroundColor: 'rgba(255,255,255,0.34)',
    height: 7,
    marginTop: 10,
    width: 1,
  },
  cardinalTick: { backgroundColor: '#DCE9E4', height: 13, width: 2 },
  northTick: { backgroundColor: '#E17868' },
  cardinal: {
    color: '#DDEBE5',
    fontSize: 14,
    fontWeight: '800',
    position: 'absolute',
  },
  north: { color: '#F08B78', left: 128, top: 28 },
  east: { right: 32, top: 126 },
  south: { bottom: 28, left: 128 },
  west: { left: 32, top: 126 },
  qiblaLayer: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  qiblaArrow: { alignItems: 'center', height: 125, marginTop: 12 },
  qiblaArrowHead: {
    borderBottomColor: '#F1CF82',
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderLeftWidth: 9,
    borderRightColor: 'transparent',
    borderRightWidth: 9,
    height: 0,
    width: 0,
  },
  qiblaLine: { backgroundColor: '#F1CF82', flex: 1, opacity: 0.92, width: 3 },
  kaaba: {
    backgroundColor: '#111A17',
    borderColor: '#D6B865',
    borderRadius: 8,
    borderWidth: 1,
    height: 58,
    overflow: 'hidden',
    position: 'absolute',
    width: 58,
    zIndex: 6,
  },
  kaabaAligned: {
    shadowColor: '#F1CF82',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },
  kaabaBand: { backgroundColor: '#D6B865', height: 7, marginTop: 13, width: '100%' },
  kaabaDoor: {
    alignSelf: 'center',
    backgroundColor: '#B99A4E',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    height: 20,
    marginTop: 10,
    width: 11,
  },
  guidancePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 22,
    flexDirection: 'row',
    marginTop: 1,
    paddingHorizontal: 17,
    paddingVertical: 10,
  },
  guidancePillAligned: { backgroundColor: '#F1CF82' },
  guidanceDot: {
    backgroundColor: '#C9A65A',
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  guidanceDotAligned: { backgroundColor: '#1A594B' },
  guidanceText: { color: '#F1E4C6', fontSize: 13, fontWeight: '800' },
  guidanceTextAligned: { color: '#123E36' },
  bearingRow: { alignItems: 'center', flexDirection: 'row', marginTop: 21, width: '100%' },
  bearingItem: { alignItems: 'center', flex: 1 },
  bearingValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  bearingLabel: { color: '#9EBBB1', fontSize: 9, marginTop: 3 },
  bearingDivider: { backgroundColor: 'rgba(255,255,255,0.15)', height: 29, width: 1 },
  errorArea: {
    alignItems: 'center',
    minHeight: 390,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  errorIcon: { color: '#F1CF82', fontSize: 36 },
  errorTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 13 },
  errorText: {
    color: '#BCD0C9',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: 'center',
  },
  errorActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  retryButton: {
    backgroundColor: '#F1CF82',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  retryButtonText: { color: '#123E36', fontSize: 12, fontWeight: '800' },
  settingsButton: {
    borderColor: '#F1CF82',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  settingsButtonText: { color: '#F1CF82', fontSize: 12, fontWeight: '800' },
  content: { paddingHorizontal: 20, paddingTop: 23 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: { color: '#1D2D28', fontSize: 20, fontWeight: '800' },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: '#E3EFE9',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  liveDot: {
    backgroundColor: '#2C806D',
    borderRadius: 3,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  liveText: { color: '#246858', fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  accuracyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 17 },
  accuracyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accuracyTitle: { color: '#6F7D78', fontSize: 11, fontWeight: '700' },
  accuracyValue: { fontSize: 17, fontWeight: '800', marginTop: 3 },
  accuracyBars: { alignItems: 'flex-end', flexDirection: 'row', gap: 4 },
  accuracyBar: { borderRadius: 3, width: 7 },
  detailDivider: {
    backgroundColor: '#E9EEEB',
    height: StyleSheet.hairlineWidth,
    marginVertical: 15,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { color: '#788681', fontSize: 12 },
  detailValue: { color: '#2E403A', fontSize: 12, fontWeight: '700' },
  calibrationCard: {
    backgroundColor: '#FFF5E4',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 13,
    padding: 15,
  },
  calibrationIcon: {
    alignItems: 'center',
    backgroundColor: '#EBCF95',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    marginRight: 13,
    width: 44,
  },
  calibrationIconText: { color: '#6F5624', fontSize: 25, fontWeight: '700' },
  calibrationCopy: { flex: 1 },
  calibrationTitle: { color: '#6F5624', fontSize: 13, fontWeight: '800' },
  calibrationText: { color: '#806D45', fontSize: 11, lineHeight: 17, marginTop: 4 },
  tipCard: {
    borderColor: '#DCE5E0',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 13,
    padding: 16,
  },
  tipTitle: { color: '#2B3C36', fontSize: 13, fontWeight: '800' },
  tipText: { color: '#6D7B76', fontSize: 11, lineHeight: 17, marginTop: 5 },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 15,
    marginTop: 15,
    paddingVertical: 13,
  },
  refreshButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
