import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useSilentMode } from '@/hooks/use-silent-mode';
import {
  formatRemainingTime,
  formatSilentWindowDate,
  formatSilentWindowRange,
  SILENT_MODE_PRAYERS,
} from '@/services/silent-mode';
import {
  SILENT_END_OPTIONS,
  SILENT_START_OPTIONS,
} from '@/services/silent-mode-settings';

function platformCopy() {
  if (Platform.OS === 'android') {
    return {
      title: 'Android sistem davranışı',
      text: 'MIHRAB bu sürümde Diyanet vakitlerine göre sessiz bir plan ve hatırlatmalar oluşturur. Telefonun Rahatsız Etmeyin modunu değiştirmek için Android’in özel sistem izni ve native mağaza derlemesi gerekir.',
    };
  }
  if (Platform.OS === 'ios') {
    return {
      title: 'iPhone Focus davranışı',
      text: 'Apple, üçüncü taraf uygulamaların Focus modunu doğrudan açıp kapatmasına izin vermez. MIHRAB planı sessizce hatırlatır; Focus otomasyonunu iPhone ayarlarından eşleştirebilirsiniz.',
    };
  }
  return {
    title: 'Telefon üzerinde çalışır',
    text: 'Web önizlemesinde planı düzenleyebilirsiniz. Sessiz yerel hatırlatmalar Android ve iOS cihazda zamanlanır.',
  };
}

function startLabel(value: number) {
  return value === 0 ? 'Vakit anı' : `${value} dk önce`;
}

function endLabel(value: number) {
  return `${value} dk sonra`;
}

async function openSilentSettings() {
  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.ZEN_MODE_SETTINGS');
      return;
    } catch {
      // Some Android vendors do not expose the standard DND settings intent.
    }
  }
  await Linking.openSettings();
}

export default function SilentModeScreen() {
  const router = useRouter();
  const {
    settings,
    summary,
    permission,
    loading,
    saving,
    error,
    now,
    activeWindow,
    nextWindow,
    todayWindows,
    setEnabled,
    setRemindersEnabled,
    setStartBeforeMinutes,
    setEndAfterMinutes,
    setPrayerEnabled,
  } = useSilentMode();
  const support = platformCopy();
  const headline = !settings.enabled
    ? 'Plan kapalı'
    : activeWindow
      ? `${activeWindow.prayerName} sessiz zamanı`
      : nextWindow
        ? `Sıradaki: ${nextWindow.prayerName}`
        : 'Plan hazır';
  const headlineDetail = !settings.enabled
    ? 'Aşağıdan açarak kişisel sessiz zamanlarını oluştur'
    : activeWindow
      ? `${formatRemainingTime(
          new Date(activeWindow.endsAt).getTime() - now.getTime(),
        )} sonra tamamlanır`
      : nextWindow
        ? `${formatSilentWindowDate(nextWindow)} · ${formatSilentWindowRange(
            nextWindow,
          )}`
        : 'Yeni Diyanet vakitleriyle otomatik yenilenir';

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
              <View
                style={[
                  styles.heroStatus,
                  settings.enabled && styles.heroStatusEnabled,
                ]}>
                <View
                  style={[
                    styles.heroStatusDot,
                    settings.enabled && styles.heroStatusDotEnabled,
                  ]}
                />
                <Text style={styles.heroStatusText}>
                  {settings.enabled ? 'PLAN AÇIK' : 'PLAN KAPALI'}
                </Text>
              </View>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · GÜNLÜK KULLANIM</Text>
            <Text style={styles.heroTitle}>Otomatik sessiz mod</Text>
            <Text style={styles.heroSubtitle}>
              Namaz vakitlerine göre sessiz zamanlarını planla ve ibadet öncesinde
              tamamen sessiz hatırlatma al.
            </Text>

            <View style={styles.statusCard}>
              <View style={styles.statusIcon}>
                <Text style={styles.statusIconText}>☾</Text>
                <View style={styles.statusSlash} />
              </View>
              <View style={styles.statusCopy}>
                <Text style={styles.statusLabel}>
                  {activeWindow ? 'ŞU ANDA' : 'SESSİZ PLAN'}
                </Text>
                <Text style={styles.statusTitle}>{headline}</Text>
                <Text numberOfLines={2} style={styles.statusSubtitle}>
                  {headlineDetail}
                </Text>
              </View>
              {saving ? (
                <ActivityIndicator color="#F1CF82" />
              ) : (
                <Text style={styles.statusCount}>
                  {settings.enabled ? todayWindows.length : 0}
                </Text>
              )}
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.masterCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.masterLabel}>ANA AYAR</Text>
                <Text style={styles.masterTitle}>Sessiz zaman planını kullan</Text>
                <Text style={styles.masterText}>
                  Diyanet vakitleri değiştiğinde plan otomatik güncellenir.
                </Text>
              </View>
              {loading ? (
                <ActivityIndicator color="#1A594B" />
              ) : (
                <Switch
                  disabled={saving}
                  onValueChange={(value) => void setEnabled(value)}
                  thumbColor={settings.enabled ? '#FFFFFF' : '#FFFFFF'}
                  trackColor={{ false: '#CAD3CF', true: '#1A594B' }}
                  value={settings.enabled}
                />
              )}
            </View>

            <View style={styles.masterDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.masterTitle}>Sessiz hatırlatmalar</Text>
                <Text style={styles.masterText}>
                  Başlangıç ve bitişte ses ve titreşim olmadan bildirim gösterir.
                </Text>
              </View>
              <Switch
                disabled={saving}
                onValueChange={(value) => void setRemindersEnabled(value)}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#CAD3CF', true: '#6E9B8E' }}
                value={settings.remindersEnabled}
              />
            </View>

            {settings.enabled && settings.remindersEnabled ? (
              <View style={styles.scheduleSummary}>
                <Text style={styles.scheduleCount}>{summary.count}</Text>
                <Text style={styles.scheduleText}>
                  {permission === 'granted'
                    ? 'sessiz hatırlatma sırada'
                    : permission === 'unsupported'
                      ? 'telefonda zamanlanacak'
                      : 'bildirim izni bekleniyor'}
                </Text>
              </View>
            ) : null}
          </View>

          {error ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>ZAMANLAMA</Text>
              <Text style={styles.sectionTitle}>Sessiz pencere</Text>
            </View>
            <Text style={styles.sectionHint}>
              Toplam {settings.startBeforeMinutes + settings.endAfterMinutes} dk
            </Text>
          </View>

          <View style={styles.timingCard}>
            <Text style={styles.optionLabel}>Ne zaman başlasın?</Text>
            <View style={styles.optionGrid}>
              {SILENT_START_OPTIONS.map((value) => {
                const selected = settings.startBeforeMinutes === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    disabled={saving}
                    key={value}
                    onPress={() => void setStartBeforeMinutes(value)}
                    style={[
                      styles.optionButton,
                      selected && styles.optionButtonSelected,
                    ]}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selected && styles.optionButtonTextSelected,
                      ]}>
                      {startLabel(value)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.optionLabel, styles.secondOptionLabel]}>
              Vakitten ne kadar sonra bitsin?
            </Text>
            <View style={styles.optionGrid}>
              {SILENT_END_OPTIONS.map((value) => {
                const selected = settings.endAfterMinutes === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    disabled={saving}
                    key={value}
                    onPress={() => void setEndAfterMinutes(value)}
                    style={[
                      styles.optionButton,
                      selected && styles.optionButtonSelected,
                    ]}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selected && styles.optionButtonTextSelected,
                      ]}>
                      {endLabel(value)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>VAKİTLER</Text>
              <Text style={styles.sectionTitle}>Hangi namazlarda?</Text>
            </View>
            <Text style={styles.sectionHint}>Her biri bağımsız</Text>
          </View>

          <View style={styles.prayerCard}>
            {SILENT_MODE_PRAYERS.map((prayer, index) => {
              const enabled = settings.prayers[prayer.key].enabled;
              return (
                <View
                  key={prayer.key}
                  style={[
                    styles.prayerRow,
                    index !== SILENT_MODE_PRAYERS.length - 1 &&
                      styles.prayerRowBorder,
                  ]}>
                  <View
                    style={[
                      styles.prayerSymbol,
                      enabled && styles.prayerSymbolEnabled,
                    ]}>
                    <Text
                      style={[
                        styles.prayerSymbolText,
                        enabled && styles.prayerSymbolTextEnabled,
                      ]}>
                      {prayer.symbol}
                    </Text>
                  </View>
                  <View style={styles.prayerCopy}>
                    <Text style={styles.prayerName}>{prayer.name}</Text>
                    <Text style={styles.prayerDetail}>
                      {enabled
                        ? `${startLabel(settings.startBeforeMinutes)} başlar · ${endLabel(
                            settings.endAfterMinutes,
                          )} biter`
                        : 'Bu vakit sessiz plana dahil değil'}
                    </Text>
                  </View>
                  <Switch
                    disabled={saving}
                    onValueChange={(value) =>
                      void setPrayerEnabled(prayer.key, value)
                    }
                    thumbColor="#FFFFFF"
                    trackColor={{ false: '#D1D9D5', true: '#77A99B' }}
                    value={enabled}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>BUGÜN</Text>
              <Text style={styles.sectionTitle}>Sessiz zamanlar</Text>
            </View>
            <Text style={styles.sectionHint}>{todayWindows.length} pencere</Text>
          </View>

          <View style={styles.todayCard}>
            {todayWindows.length ? (
              todayWindows.map((window, index) => {
                const active = activeWindow?.id === window.id;
                const next = nextWindow?.id === window.id;
                return (
                  <View
                    key={window.id}
                    style={[
                      styles.todayRow,
                      index !== todayWindows.length - 1 &&
                        styles.todayRowBorder,
                      active && styles.todayRowActive,
                    ]}>
                    <View style={styles.todayTime}>
                      <Text style={styles.todayTimeText}>{window.prayerTime}</Text>
                    </View>
                    <View style={styles.todayCopy}>
                      <Text style={styles.todayTitle}>{window.prayerName}</Text>
                      <Text style={styles.todaySubtitle}>
                        {formatSilentWindowRange(window)}
                      </Text>
                    </View>
                    {active || next ? (
                      <View
                        style={[
                          styles.todayBadge,
                          active && styles.todayBadgeActive,
                        ]}>
                        <Text
                          style={[
                            styles.todayBadgeText,
                            active && styles.todayBadgeTextActive,
                          ]}>
                          {active ? 'AKTİF' : 'SIRADA'}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.todayCheck}>✓</Text>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyPlan}>
                <Text style={styles.emptyPlanIcon}>☾</Text>
                <Text style={styles.emptyPlanTitle}>
                  {settings.enabled ? 'Bugün için pencere yok' : 'Plan henüz kapalı'}
                </Text>
                <Text style={styles.emptyPlanText}>
                  Ana ayarı açtığınızda seçili namazlar burada listelenir.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.platformCard}>
            <View style={styles.platformIcon}>
              <Text style={styles.platformIconText}>i</Text>
            </View>
            <View style={styles.platformCopy}>
              <Text style={styles.platformTitle}>{support.title}</Text>
              <Text style={styles.platformText}>{support.text}</Text>
            </View>
          </View>

          {Platform.OS !== 'web' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void openSilentSettings()}
              style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>
                {Platform.OS === 'android'
                  ? 'Rahatsız Etmeyin ayarlarını aç'
                  : 'Telefon ayarlarını aç'}
              </Text>
              <Text style={styles.settingsButtonArrow}>›</Text>
            </Pressable>
          ) : null}

          <Text style={styles.footerNotice}>
            MIHRAB sessiz planı, sistemin izin verdiği ölçüde çalışır. Uygulama
            telefonun ses seviyesini kullanıcıdan habersiz değiştirmez.
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
    backgroundColor: '#172F42',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroStatus: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroStatusEnabled: {
    backgroundColor: 'rgba(105,198,157,0.14)',
  },
  heroStatusDot: {
    backgroundColor: '#8997A2',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  heroStatusDotEnabled: {
    backgroundColor: '#75D3A8',
  },
  heroStatusText: {
    color: '#DDE6EC',
    fontSize: 8,
    fontWeight: '900',
  },
  eyebrow: {
    color: '#F1CF82',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 25,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
    marginTop: 6,
  },
  heroSubtitle: {
    color: '#B8C9D3',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 550,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 22,
    padding: 14,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: '#F1CF82',
    borderRadius: 16,
    height: 49,
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
    width: 49,
  },
  statusIconText: {
    color: '#172F42',
    fontSize: 27,
  },
  statusSlash: {
    backgroundColor: '#172F42',
    height: 2,
    position: 'absolute',
    transform: [{ rotate: '-42deg' }],
    width: 27,
  },
  statusCopy: {
    flex: 1,
  },
  statusLabel: {
    color: '#91AABA',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },
  statusSubtitle: {
    color: '#B7C7D0',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },
  statusCount: {
    color: '#F1CF82',
    fontSize: 25,
    fontWeight: '900',
    marginLeft: 8,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  masterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  switchCopy: {
    flex: 1,
    paddingRight: 12,
  },
  masterLabel: {
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  masterTitle: {
    color: '#273832',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  masterText: {
    color: '#778680',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  masterDivider: {
    backgroundColor: '#E7ECE9',
    height: StyleSheet.hairlineWidth,
    marginVertical: 15,
  },
  scheduleSummary: {
    alignItems: 'center',
    backgroundColor: '#EEF5F1',
    borderRadius: 14,
    flexDirection: 'row',
    marginTop: 14,
    padding: 11,
  },
  scheduleCount: {
    color: '#1A594B',
    fontSize: 20,
    fontWeight: '900',
    marginRight: 8,
  },
  scheduleText: {
    color: '#597069',
    fontSize: 10,
    fontWeight: '800',
  },
  noticeCard: {
    backgroundColor: '#FFF4DF',
    borderRadius: 15,
    marginTop: 12,
    padding: 13,
  },
  noticeText: {
    color: '#765C28',
    fontSize: 10,
    lineHeight: 16,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
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
  sectionHint: {
    color: '#7D8B86',
    fontSize: 9,
  },
  timingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 12,
    padding: 15,
  },
  optionLabel: {
    color: '#586B64',
    fontSize: 10,
    fontWeight: '800',
  },
  secondOptionLabel: {
    marginTop: 17,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: '#EEF2F0',
    borderRadius: 12,
    minWidth: 77,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#1A594B',
  },
  optionButtonText: {
    color: '#64746E',
    fontSize: 10,
    fontWeight: '800',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 12,
    overflow: 'hidden',
  },
  prayerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 70,
    paddingHorizontal: 14,
  },
  prayerRowBorder: {
    borderBottomColor: '#E8EEEA',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  prayerSymbol: {
    alignItems: 'center',
    backgroundColor: '#EDF1EF',
    borderRadius: 15,
    height: 34,
    justifyContent: 'center',
    marginRight: 11,
    width: 34,
  },
  prayerSymbolEnabled: {
    backgroundColor: '#1A594B',
  },
  prayerSymbolText: {
    color: '#74827D',
    fontSize: 14,
  },
  prayerSymbolTextEnabled: {
    color: '#FFFFFF',
  },
  prayerCopy: {
    flex: 1,
    paddingRight: 8,
  },
  prayerName: {
    color: '#2B3C36',
    fontSize: 14,
    fontWeight: '900',
  },
  prayerDetail: {
    color: '#82908B',
    fontSize: 9,
    marginTop: 4,
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 12,
    overflow: 'hidden',
  },
  todayRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 14,
  },
  todayRowBorder: {
    borderBottomColor: '#E8EEEA',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  todayRowActive: {
    backgroundColor: '#EEF6F2',
  },
  todayTime: {
    alignItems: 'center',
    backgroundColor: '#EDF1EF',
    borderRadius: 12,
    justifyContent: 'center',
    marginRight: 11,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  todayTimeText: {
    color: '#1A594B',
    fontSize: 10,
    fontWeight: '900',
  },
  todayCopy: {
    flex: 1,
  },
  todayTitle: {
    color: '#2B3C36',
    fontSize: 13,
    fontWeight: '900',
  },
  todaySubtitle: {
    color: '#7C8B85',
    fontSize: 9,
    marginTop: 4,
  },
  todayBadge: {
    backgroundColor: '#E8EDEA',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  todayBadgeActive: {
    backgroundColor: '#1A594B',
  },
  todayBadgeText: {
    color: '#6E7D77',
    fontSize: 7,
    fontWeight: '900',
  },
  todayBadgeTextActive: {
    color: '#FFFFFF',
  },
  todayCheck: {
    color: '#9AA6A1',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyPlan: {
    alignItems: 'center',
    padding: 26,
  },
  emptyPlanIcon: {
    color: '#1A594B',
    fontSize: 28,
  },
  emptyPlanTitle: {
    color: '#2A3B35',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
  },
  emptyPlanText: {
    color: '#82908B',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
    textAlign: 'center',
  },
  platformCard: {
    backgroundColor: '#E8EDF4',
    borderColor: '#CBD7E2',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 23,
    padding: 15,
  },
  platformIcon: {
    alignItems: 'center',
    backgroundColor: '#263D50',
    borderRadius: 14,
    height: 31,
    justifyContent: 'center',
    marginRight: 11,
    width: 31,
  },
  platformIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  platformCopy: {
    flex: 1,
  },
  platformTitle: {
    color: '#2E4659',
    fontSize: 12,
    fontWeight: '900',
  },
  platformText: {
    color: '#607483',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },
  settingsButton: {
    alignItems: 'center',
    borderColor: '#1A594B',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  settingsButtonText: {
    color: '#1A594B',
    fontSize: 11,
    fontWeight: '900',
  },
  settingsButtonArrow: {
    color: '#1A594B',
    fontSize: 20,
  },
  footerNotice: {
    color: '#7F8D88',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 18,
    textAlign: 'center',
  },
});
