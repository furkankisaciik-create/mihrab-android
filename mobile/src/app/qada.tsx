import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQadaTracker } from '@/hooks/use-qada-tracker';
import { formatDailyContentDate, getIstanbulDateKey } from '@/services/daily-content-date';
import { QADA_PRAYERS } from '@/services/qada-tracker';
import type { QadaActivity, QadaPrayerKey } from '@/types/qada';

const DAILY_TARGETS = [1, 3, 5, 10];

function getShortDay(dateKey: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
  })
    .format(new Date(`${dateKey}T12:00:00+03:00`))
    .replace('.', '');
}

function activityText(activity: QadaActivity) {
  const prayer = QADA_PRAYERS.find((item) => item.key === activity.prayerKey);
  if (activity.type === 'completed') {
    return `${prayer?.name ?? 'Namaz'} kazası kılındı`;
  }
  if (activity.type === 'added') {
    return `${prayer?.name ?? 'Namaz'} borcuna ${activity.quantity} eklendi`;
  }
  return `${prayer?.name ?? 'Namaz'} borcu ${activity.quantity} olarak düzenlendi`;
}

function activityTime(activity: QadaActivity) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(activity.occurredAt));
}

export default function QadaTrackerScreen() {
  const router = useRouter();
  const {
    state,
    loading,
    summary,
    complete,
    addDebt,
    setBalance,
    setDailyTarget,
    undoLatest,
  } = useQadaTracker();
  const [editingKey, setEditingKey] = useState<QadaPrayerKey | null>(null);
  const [balanceInput, setBalanceInput] = useState('');

  const beginEditing = (key: QadaPrayerKey) => {
    setEditingKey(key);
    setBalanceInput(String(state.remaining[key]));
  };

  const saveBalance = () => {
    if (!editingKey) {
      return;
    }
    const value = Number(balanceInput.replace(/[^\d]/g, ''));
    setBalance(editingKey, Number.isFinite(value) ? value : 0);
    setEditingKey(null);
    setBalanceInput('');
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#1A594B" size="large" />
        <Text style={styles.loadingText}>Kaza takibi hazırlanıyor</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <View style={styles.heroTop}>
              <Pressable
                accessibilityLabel="Günlük namaz takibine dön"
                accessibilityRole="button"
                onPress={() => router.push('/tracker')}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>Günlük takip</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="MIHRAB yol haritasını aç"
                accessibilityRole="button"
                onPress={() => router.push('/explore')}
                style={styles.heroLink}>
                <Text style={styles.heroLinkText}>Plan</Text>
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>MIHRAB · İBADET TAKİBİ</Text>
            <Text style={styles.title}>Kaza namazı takibi</Text>
            <Text style={styles.date}>{formatDailyContentDate(getIstanbulDateKey())}</Text>

            <View style={styles.heroSummary}>
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricValue}>{summary.totalRemaining}</Text>
                <Text style={styles.heroMetricLabel}>Toplam kalan</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricValue}>{summary.totalCompleted}</Text>
                <Text style={styles.heroMetricLabel}>Toplam kılınan</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricValue}>{summary.todayCompleted}</Text>
                <Text style={styles.heroMetricLabel}>Bugün</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.guidanceCard}>
            <View style={styles.guidanceIcon}>
              <Text style={styles.guidanceIconText}>i</Text>
            </View>
            <View style={styles.guidanceCopy}>
              <Text style={styles.guidanceTitle}>Kişisel hesabınızı girin</Text>
              <Text style={styles.guidanceText}>
                Her vakit için belirlediğiniz mevcut kaza borcunu “Düzenle” ile kaydedin.
                MIHRAB yalnızca girdiğiniz sayıları takip eder.
              </Text>
            </View>
          </View>

          <View style={styles.targetCard}>
            <View style={styles.targetHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>BUGÜNKÜ HEDEF</Text>
                <Text style={styles.targetTitle}>
                  {summary.todayCompleted} / {summary.dailyTarget} kaza namazı
                </Text>
              </View>
              <Text style={styles.targetPercent}>
                %{Math.round(summary.targetProgress)}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${summary.targetProgress}%` }]} />
            </View>
            <View style={styles.targetOptions}>
              {DAILY_TARGETS.map((target) => (
                <Pressable
                  key={target}
                  accessibilityRole="button"
                  onPress={() => setDailyTarget(target)}
                  style={[
                    styles.targetOption,
                    state.dailyTarget === target && styles.targetOptionActive,
                  ]}>
                  <Text
                    style={[
                      styles.targetOptionText,
                      state.dailyTarget === target && styles.targetOptionTextActive,
                    ]}>
                    {target}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>KAZA BORCU</Text>
              <Text style={styles.sectionTitle}>Vakitlere göre takip</Text>
            </View>
            <Text style={styles.sectionHint}>Cihazda saklanır</Text>
          </View>

          <View style={styles.prayerList}>
            {QADA_PRAYERS.map((prayer) => {
              const remaining = state.remaining[prayer.key];
              const isEditing = editingKey === prayer.key;

              return (
                <View key={prayer.key} style={styles.prayerCard}>
                  <View style={styles.prayerHeader}>
                    <View style={styles.prayerSymbol}>
                      <Text style={styles.prayerSymbolText}>{prayer.symbol}</Text>
                    </View>
                    <View style={styles.prayerCopy}>
                      <Text style={styles.prayerName}>{prayer.name}</Text>
                      <Text style={styles.prayerDetail}>{prayer.detail}</Text>
                    </View>
                    <View style={styles.balanceCopy}>
                      <Text style={styles.balanceValue}>{remaining}</Text>
                      <Text style={styles.balanceLabel}>kalan</Text>
                    </View>
                  </View>

                  {isEditing ? (
                    <View style={styles.editRow}>
                      <TextInput
                        accessibilityLabel={`${prayer.name} kaza borcu`}
                        autoFocus
                        inputMode="numeric"
                        keyboardType="number-pad"
                        maxLength={7}
                        onChangeText={(value) => setBalanceInput(value.replace(/[^\d]/g, ''))}
                        onSubmitEditing={saveBalance}
                        placeholder="0"
                        selectTextOnFocus
                        style={styles.balanceInput}
                        value={balanceInput}
                      />
                      <Pressable onPress={saveBalance} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setEditingKey(null)}
                        style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Vazgeç</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.prayerActions}>
                      <Pressable
                        accessibilityLabel={`${prayer.name} borcunu düzenle`}
                        accessibilityRole="button"
                        onPress={() => beginEditing(prayer.key)}
                        style={styles.editButton}>
                        <Text style={styles.editButtonText}>Düzenle</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`${prayer.name} borcuna bir ekle`}
                        accessibilityRole="button"
                        onPress={() => addDebt(prayer.key)}
                        style={styles.addButton}>
                        <Text style={styles.addButtonText}>+1 borç</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Bir ${prayer.name} kazası kılındı`}
                        accessibilityRole="button"
                        disabled={remaining === 0}
                        onPress={() => complete(prayer.key)}
                        style={[
                          styles.completeButton,
                          remaining === 0 && styles.completeButtonDisabled,
                        ]}>
                        <Text
                          style={[
                            styles.completeButtonText,
                            remaining === 0 && styles.completeButtonTextDisabled,
                          ]}>
                          {remaining === 0 ? 'Borç yok' : '1 kaza kıldım'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.statisticsHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>İLERLEME</Text>
              <Text style={styles.sectionTitle}>Son 7 gün</Text>
            </View>
            <Text style={styles.lastSevenValue}>{summary.lastSevenCompleted} kaza</Text>
          </View>

          <View style={styles.weekCard}>
            <View style={styles.weekBars}>
              {summary.lastSevenDays.map((day) => {
                const maxCompleted = Math.max(
                  1,
                  ...summary.lastSevenDays.map((item) => item.completed),
                );
                const height = Math.max(7, (day.completed / maxCompleted) * 58);
                const isToday = day.dateKey === getIstanbulDateKey();
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

          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>SON HAREKETLER</Text>
              <Text style={styles.sectionTitle}>Kayıt geçmişi</Text>
            </View>
            {state.activities.length > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={undoLatest}
                style={styles.undoButton}>
                <Text style={styles.undoButtonText}>Son işlemi geri al</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.historyCard}>
            {state.activities.length ? (
              state.activities.slice(0, 5).map((activity) => (
                <View key={activity.id} style={styles.historyRow}>
                  <View
                    style={[
                      styles.historyDot,
                      activity.type === 'completed' && styles.historyDotCompleted,
                    ]}
                  />
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyText}>{activityText(activity)}</Text>
                    <Text style={styles.historyTime}>{activityTime(activity)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryTitle}>Henüz kayıt yok</Text>
                <Text style={styles.emptyHistoryText}>
                  Borcunuzu girdikten veya bir kaza namazı kaydettikten sonra işlemler burada görünür.
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.dataNotice}>
            Kaza hesabı kişisel beyanınıza dayanır. MIHRAB dinî hüküm veya borç hesabı üretmez;
            yalnızca girdiğiniz kayıtları bu cihazda saklar.
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
    paddingTop: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroLink: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroLinkText: {
    color: '#D7E6E0',
    fontSize: 10,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#A7C7BB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  date: {
    color: '#F1CF82',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 9,
    textTransform: 'capitalize',
  },
  heroSummary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    flexDirection: 'row',
    marginTop: 20,
    paddingVertical: 16,
  },
  heroMetric: {
    alignItems: 'center',
    flex: 1,
  },
  heroMetricValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  heroMetricLabel: {
    color: '#AFC9C0',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },
  heroDivider: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    width: StyleSheet.hairlineWidth,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  guidanceCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFF5DE',
    borderColor: '#EAD9AA',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  guidanceIcon: {
    alignItems: 'center',
    backgroundColor: '#B99131',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    marginRight: 11,
    width: 30,
  },
  guidanceIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  guidanceCopy: {
    flex: 1,
  },
  guidanceTitle: {
    color: '#5E4B22',
    fontSize: 12,
    fontWeight: '900',
  },
  guidanceText: {
    color: '#776744',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },
  targetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 14,
    padding: 16,
  },
  targetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionEyebrow: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  targetTitle: {
    color: '#273731',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  targetPercent: {
    color: '#1A594B',
    fontSize: 18,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: '#E4ECE8',
    borderRadius: 6,
    height: 7,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#1A594B',
    borderRadius: 6,
    height: '100%',
  },
  targetOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  targetOption: {
    alignItems: 'center',
    backgroundColor: '#F0F4F2',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 8,
  },
  targetOptionActive: {
    backgroundColor: '#1A594B',
  },
  targetOptionText: {
    color: '#62736D',
    fontSize: 11,
    fontWeight: '800',
  },
  targetOptionTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#1C2A26',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 3,
  },
  sectionHint: {
    color: '#8A9692',
    fontSize: 9,
  },
  prayerList: {
    gap: 10,
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 14,
  },
  prayerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  prayerSymbol: {
    alignItems: 'center',
    backgroundColor: '#E8F1EC',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    width: 38,
  },
  prayerSymbolText: {
    color: '#1A594B',
    fontSize: 14,
    fontWeight: '900',
  },
  prayerCopy: {
    flex: 1,
  },
  prayerName: {
    color: '#293A34',
    fontSize: 15,
    fontWeight: '900',
  },
  prayerDetail: {
    color: '#87938F',
    fontSize: 9,
    marginTop: 3,
  },
  balanceCopy: {
    alignItems: 'flex-end',
  },
  balanceValue: {
    color: '#174D42',
    fontSize: 22,
    fontWeight: '900',
  },
  balanceLabel: {
    color: '#8A9692',
    fontSize: 8,
    fontWeight: '700',
  },
  prayerActions: {
    borderTopColor: '#E9EEEB',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 11,
  },
  editButton: {
    backgroundColor: '#F0F3F1',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  editButtonText: {
    color: '#60716B',
    fontSize: 9,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: '#FFF5DE',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  addButtonText: {
    color: '#876D32',
    fontSize: 9,
    fontWeight: '800',
  },
  completeButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 11,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  completeButtonDisabled: {
    backgroundColor: '#EDF1EF',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  completeButtonTextDisabled: {
    color: '#9AA49F',
  },
  editRow: {
    borderTopColor: '#E9EEEB',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 11,
  },
  balanceInput: {
    backgroundColor: '#F3F6F4',
    borderColor: '#B8CAC3',
    borderRadius: 11,
    borderWidth: 1,
    color: '#21342D',
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    minHeight: 38,
    paddingHorizontal: 11,
  },
  saveButton: {
    backgroundColor: '#1A594B',
    borderRadius: 11,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  cancelButton: {
    backgroundColor: '#EDF1EF',
    borderRadius: 11,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  cancelButtonText: {
    color: '#6F7E79',
    fontSize: 9,
    fontWeight: '800',
  },
  statisticsHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  lastSevenValue: {
    color: '#1A594B',
    fontSize: 11,
    fontWeight: '900',
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
    height: 58,
    justifyContent: 'flex-end',
    marginTop: 5,
    overflow: 'hidden',
    width: 13,
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
  historyHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  undoButton: {
    backgroundColor: '#E8F1EC',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  undoButtonText: {
    color: '#1A594B',
    fontSize: 9,
    fontWeight: '900',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    marginTop: 11,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  historyRow: {
    alignItems: 'center',
    borderBottomColor: '#E9EEEB',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 54,
  },
  historyDot: {
    backgroundColor: '#C39A42',
    borderRadius: 5,
    height: 10,
    marginRight: 11,
    width: 10,
  },
  historyDotCompleted: {
    backgroundColor: '#1A594B',
  },
  historyCopy: {
    flex: 1,
  },
  historyText: {
    color: '#35453F',
    fontSize: 11,
    fontWeight: '800',
  },
  historyTime: {
    color: '#939E9A',
    fontSize: 8,
    marginTop: 3,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  emptyHistoryTitle: {
    color: '#4C5E57',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyHistoryText: {
    color: '#87938F',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  dataNotice: {
    color: '#84918D',
    fontSize: 10,
    lineHeight: 16,
    marginHorizontal: 14,
    marginTop: 18,
    textAlign: 'center',
  },
});
