import { useEffect } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotificationSettings } from '@/hooks/use-notification-settings';
import {
  REMINDER_OFFSETS,
  type NotificationPermissionState,
  type ReminderOffset,
} from '@/services/notification-settings';
import type { PrayerKey } from '@/types/prayer';

const PRAYERS: { key: PrayerKey; name: string; symbol: string }[] = [
  { key: 'imsak', name: 'İmsak', symbol: '☾' },
  { key: 'gunes', name: 'Güneş', symbol: '☀' },
  { key: 'ogle', name: 'Öğle', symbol: '◉' },
  { key: 'ikindi', name: 'İkindi', symbol: '◒' },
  { key: 'aksam', name: 'Akşam', symbol: '◐' },
  { key: 'yatsi', name: 'Yatsı', symbol: '☽' },
];

function reminderLabel(offset: ReminderOffset) {
  if (offset === 60) {
    return '1 saat önce';
  }
  if (offset === 0) {
    return 'Vakit şimdi';
  }
  return `${offset} dk önce`;
}

function permissionCopy(permission: NotificationPermissionState) {
  if (permission === 'granted') {
    return 'Telefon bildirim izni açık';
  }
  if (permission === 'denied') {
    return 'Bildirim izni telefon ayarlarından kapalı';
  }
  if (permission === 'unsupported') {
    return 'Bildirimler Android ve iOS cihazlarda çalışır';
  }
  return 'Bildirim izni henüz istenmedi';
}

function formatScheduledUntil(value: string | null) {
  if (!value) {
    return null;
  }
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function NotificationsScreen() {
  const {
    settings,
    permission,
    summary,
    loading,
    saving,
    error,
    setEnabled,
    setPrayerEnabled,
    setPrayerSound,
    toggleReminder,
    refreshPermission,
  } = useNotificationSettings();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermission();
      }
    });
    return () => subscription.remove();
  }, [refreshPermission]);

  const scheduledUntil = formatScheduledUntil(summary.scheduledUntil);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>MIHRAB HATIRLATMALARI</Text>
          <Text style={styles.title}>Vakit bildirimleri</Text>
          <Text style={styles.subtitle}>
            Her vakti, hatırlatma zamanlarını ve ses davranışını ayrı ayrı ayarlayın.
          </Text>

          <View style={styles.masterCard}>
            <View style={styles.masterHeader}>
              <View style={styles.masterCopy}>
                <Text style={styles.masterTitle}>Bildirimleri kullan</Text>
                <Text style={styles.masterSubtitle}>{permissionCopy(permission)}</Text>
              </View>
              {loading || saving ? (
                <ActivityIndicator color="#1A594B" />
              ) : (
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => void setEnabled(value)}
                  trackColor={{ false: '#CCD6D1', true: '#7DB5A7' }}
                  thumbColor={settings.enabled ? '#175749' : '#FFFFFF'}
                />
              )}
            </View>

            {settings.enabled && permission === 'granted' && (
              <View style={styles.scheduleSummary}>
                <Text style={styles.scheduleCount}>{summary.count}</Text>
                <View style={styles.scheduleCopy}>
                  <Text style={styles.scheduleTitle}>bildirim sırada</Text>
                  <Text style={styles.scheduleText}>
                    {scheduledUntil
                      ? `${scheduledUntil} tarihine kadar planlandı`
                      : 'Yeni Diyanet vakitleri bekleniyor'}
                  </Text>
                </View>
              </View>
            )}

            {permission === 'denied' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void Linking.openSettings()}
                style={styles.settingsButton}>
                <Text style={styles.settingsButtonText}>Telefon ayarlarını aç</Text>
              </Pressable>
            )}
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Başlangıç ayarı</Text>
            <Text style={styles.infoText}>
              Dört hatırlatma da seçili, tümü sessizdir. Bir vakti sesli yapmak veya istemediğiniz
              hatırlatmaları kaldırmak için aşağıdaki seçenekleri kullanın.
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vakitler</Text>
            <Text style={styles.sectionHint}>Her biri bağımsız</Text>
          </View>

          <View style={styles.prayerList}>
            {PRAYERS.map((prayer) => {
              const prayerSetting = settings.prayers[prayer.key];
              return (
                <View
                  key={prayer.key}
                  style={[styles.prayerCard, !prayerSetting.enabled && styles.prayerCardDisabled]}>
                  <View style={styles.prayerHeader}>
                    <View style={styles.prayerIdentity}>
                      <View style={styles.prayerSymbol}>
                        <Text style={styles.prayerSymbolText}>{prayer.symbol}</Text>
                      </View>
                      <View>
                        <Text style={styles.prayerName}>{prayer.name}</Text>
                        <Text style={styles.prayerStatus}>
                          {prayerSetting.enabled ? 'Hatırlatmalar açık' : 'Bu vakit kapalı'}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      disabled={saving}
                      value={prayerSetting.enabled}
                      onValueChange={(value) => void setPrayerEnabled(prayer.key, value)}
                      trackColor={{ false: '#D4DCD8', true: '#89BCAF' }}
                      thumbColor={prayerSetting.enabled ? '#1A594B' : '#FFFFFF'}
                    />
                  </View>

                  <Text style={styles.optionLabel}>Bildirim biçimi</Text>
                  <View style={styles.soundOptions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: saving || !prayerSetting.enabled,
                        selected: !prayerSetting.soundEnabled,
                      }}
                      disabled={saving || !prayerSetting.enabled}
                      onPress={() => void setPrayerSound(prayer.key, false)}
                      style={[
                        styles.soundButton,
                        !prayerSetting.soundEnabled && styles.soundButtonSelected,
                      ]}>
                      <Text
                        style={[
                          styles.soundButtonText,
                          !prayerSetting.soundEnabled && styles.soundButtonTextSelected,
                        ]}>
                        Sessiz
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: saving || !prayerSetting.enabled,
                        selected: prayerSetting.soundEnabled,
                      }}
                      disabled={saving || !prayerSetting.enabled}
                      onPress={() => void setPrayerSound(prayer.key, true)}
                      style={[
                        styles.soundButton,
                        prayerSetting.soundEnabled && styles.soundButtonSelected,
                      ]}>
                      <Text
                        style={[
                          styles.soundButtonText,
                          prayerSetting.soundEnabled && styles.soundButtonTextSelected,
                        ]}>
                        Sesli
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={styles.optionLabel}>Hatırlatma zamanları</Text>
                  <View style={styles.reminderOptions}>
                    {REMINDER_OFFSETS.map((offset) => {
                      const selected = prayerSetting.reminders.includes(offset);
                      return (
                        <Pressable
                          key={offset}
                          accessibilityRole="button"
                          accessibilityState={{
                            disabled: saving || !prayerSetting.enabled,
                            selected,
                          }}
                          disabled={saving || !prayerSetting.enabled}
                          onPress={() => void toggleReminder(prayer.key, offset)}
                          style={[
                            styles.reminderButton,
                            selected && styles.reminderButtonSelected,
                          ]}>
                          <Text
                            style={[
                              styles.reminderButtonText,
                              selected && styles.reminderButtonTextSelected,
                            ]}>
                            {reminderLabel(offset)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {prayerSetting.enabled && prayerSetting.reminders.length === 0 && (
                    <Text style={styles.emptyReminder}>En az bir hatırlatma zamanı seçin.</Text>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.footerNotice}>
            MIHRAB sıradaki en fazla 60 yerel bildirimi planlar. Diyanet vakitleri veya konum
            yenilendiğinde eski plan silinir ve güncel saatlerle yeniden kurulur.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6F2',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 130,
  },
  eyebrow: {
    color: '#1D6555',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    color: '#182723',
    fontSize: 31,
    fontWeight: '800',
    marginTop: 7,
  },
  subtitle: {
    color: '#64736E',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  masterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 24,
    padding: 18,
  },
  masterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterCopy: {
    flex: 1,
    paddingRight: 16,
  },
  masterTitle: {
    color: '#1D2E28',
    fontSize: 17,
    fontWeight: '800',
  },
  masterSubtitle: {
    color: '#74817D',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  scheduleSummary: {
    borderTopColor: '#E6ECE8',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    paddingTop: 15,
  },
  scheduleCount: {
    color: '#1A594B',
    fontSize: 28,
    fontWeight: '800',
    marginRight: 12,
  },
  scheduleCopy: {
    flex: 1,
  },
  scheduleTitle: {
    color: '#284139',
    fontSize: 13,
    fontWeight: '800',
  },
  scheduleText: {
    color: '#7A8984',
    fontSize: 11,
    marginTop: 2,
  },
  settingsButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F0EB',
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  settingsButtonText: {
    color: '#1A594B',
    fontSize: 12,
    fontWeight: '800',
  },
  errorCard: {
    backgroundColor: '#FFF1EE',
    borderColor: '#EECFC7',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 13,
    padding: 13,
  },
  errorText: {
    color: '#8A443A',
    fontSize: 12,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#EEF5F1',
    borderRadius: 17,
    marginTop: 14,
    padding: 15,
  },
  infoTitle: {
    color: '#254E43',
    fontSize: 13,
    fontWeight: '800',
  },
  infoText: {
    color: '#60746D',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 13,
    marginTop: 25,
  },
  sectionTitle: {
    color: '#1C2A26',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#87938F',
    fontSize: 11,
    fontWeight: '600',
  },
  prayerList: {
    gap: 13,
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
  },
  prayerCardDisabled: {
    opacity: 0.62,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerSymbol: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#EAF1ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prayerSymbolText: {
    color: '#1A594B',
    fontSize: 19,
  },
  prayerName: {
    color: '#23332E',
    fontSize: 16,
    fontWeight: '800',
  },
  prayerStatus: {
    color: '#82908B',
    fontSize: 11,
    marginTop: 3,
  },
  optionLabel: {
    color: '#6E7D78',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  soundOptions: {
    backgroundColor: '#F0F3F1',
    borderRadius: 13,
    flexDirection: 'row',
    padding: 4,
  },
  soundButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 9,
  },
  soundButtonSelected: {
    backgroundColor: '#1A594B',
  },
  soundButtonText: {
    color: '#66756F',
    fontSize: 12,
    fontWeight: '700',
  },
  soundButtonTextSelected: {
    color: '#FFFFFF',
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderButton: {
    backgroundColor: '#F0F3F1',
    borderColor: '#E1E7E3',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  reminderButtonSelected: {
    backgroundColor: '#E1EFE8',
    borderColor: '#76AA9B',
  },
  reminderButtonText: {
    color: '#77847F',
    fontSize: 11,
    fontWeight: '700',
  },
  reminderButtonTextSelected: {
    color: '#185447',
  },
  emptyReminder: {
    color: '#A26339',
    fontSize: 11,
    marginTop: 10,
  },
  footerNotice: {
    color: '#84918D',
    fontSize: 11,
    lineHeight: 17,
    marginHorizontal: 12,
    marginTop: 20,
    textAlign: 'center',
  },
});
