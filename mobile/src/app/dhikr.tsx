import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDhikrCounter } from '@/hooks/use-dhikr-counter';
import { formatDailyContentDate } from '@/services/daily-content-date';
import { DHIKR_PRESETS, DHIKR_TARGET_OPTIONS } from '@/services/dhikr-counter';

export default function DhikrScreen() {
  const {
    state,
    loading,
    selectedPreset,
    selectedSession,
    summary,
    select,
    increment,
    undo,
    reset,
    setTarget,
    setHapticsEnabled,
  } = useDhikrCounter();
  const [customTargetVisible, setCustomTargetVisible] = useState(false);
  const [customTarget, setCustomTargetValue] = useState(String(selectedSession.target));
  const [resetVisible, setResetVisible] = useState(false);
  const progress = Math.min(100, (selectedSession.count / selectedSession.target) * 100);
  const targetCompleted = selectedSession.count >= selectedSession.target;
  const customTargetNumber = Math.round(Number(customTarget));
  const customTargetValid =
    Number.isFinite(customTargetNumber) &&
    customTargetNumber >= 1 &&
    customTargetNumber <= 9999;

  const openCustomTarget = () => {
    setCustomTargetValue(String(selectedSession.target));
    setCustomTargetVisible(true);
  };

  const applyCustomTarget = () => {
    if (!customTargetValid) {
      return;
    }
    setTarget(customTargetNumber);
    setCustomTargetVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#1A594B" size="large" />
        <Text style={styles.loadingScreenText}>Zikir sayacı hazırlanıyor</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
            <Text style={styles.eyebrow}>MIHRAB · İBADET ARAÇLARI</Text>
            <Text style={styles.title}>Zikir sayacı</Text>
            <Text style={styles.date}>{formatDailyContentDate(state.currentDateKey)}</Text>
            <View style={styles.heroStats}>
              <View>
                <Text style={styles.heroStatValue}>{summary.today.total}</Text>
                <Text style={styles.heroStatLabel}>Bugünkü toplam</Text>
              </View>
              <View style={styles.heroDivider} />
              <View>
                <Text style={styles.heroStatValue}>{summary.today.completedRounds}</Text>
                <Text style={styles.heroStatLabel}>Tamamlanan tur</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>ZİKİR SEÇ</Text>
          <ScrollView
            contentContainerStyle={styles.presetList}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {DHIKR_PRESETS.map((preset) => {
              const active = state.selectedKey === preset.key;
              return (
                <Pressable
                  key={preset.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => select(preset.key)}
                  style={({ pressed }) => [
                    styles.presetChip,
                    active && styles.presetChipActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>
                    {preset.title}
                  </Text>
                  <Text style={[styles.presetCount, active && styles.presetCountActive]}>
                    {state.sessions[preset.key].count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.phraseCard}>
            <Text accessibilityLanguage="ar" style={styles.arabicPhrase}>
              {selectedPreset.arabic}
            </Text>
            <Text style={styles.phraseTitle}>{selectedPreset.title}</Text>
            <Text style={styles.phraseMeaning}>{selectedPreset.meaning}</Text>
          </View>

          <View style={styles.targetHeader}>
            <Text style={styles.sectionLabel}>HEDEF</Text>
            <Text style={styles.targetHint}>Hedef değişince bu oturum sıfırlanır</Text>
          </View>
          <View style={styles.targetOptions}>
            {DHIKR_TARGET_OPTIONS.map((target) => {
              const active = selectedSession.target === target;
              return (
                <Pressable
                  key={target}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setTarget(target)}
                  style={({ pressed }) => [
                    styles.targetChip,
                    active && styles.targetChipActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.targetChipText, active && styles.targetChipTextActive]}>
                    {target}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              onPress={openCustomTarget}
              style={({ pressed }) => [
                styles.targetChip,
                !DHIKR_TARGET_OPTIONS.includes(
                  selectedSession.target as (typeof DHIKR_TARGET_OPTIONS)[number],
                ) && styles.targetChipActive,
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  styles.targetChipText,
                  !DHIKR_TARGET_OPTIONS.includes(
                    selectedSession.target as (typeof DHIKR_TARGET_OPTIONS)[number],
                  ) && styles.targetChipTextActive,
                ]}>
                Özel
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zikri bir artır"
            accessibilityHint="Her dokunuş sayacı bir artırır"
            onPress={increment}
            style={({ pressed }) => [
              styles.counterButton,
              targetCompleted && styles.counterButtonCompleted,
              pressed && styles.counterButtonPressed,
            ]}>
            <Text style={styles.counterInstruction}>DOKUN VE SAY</Text>
            <Text style={styles.counterValue}>{selectedSession.count}</Text>
            <Text style={styles.counterTarget}>Hedef {selectedSession.target}</Text>
          </Pressable>

          <View style={styles.progressArea}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Oturum ilerlemesi</Text>
              <Text style={styles.progressValue}>%{Math.round(progress)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {targetCompleted && (
            <View style={styles.completedCard}>
              <View style={styles.completedIcon}>
                <Text style={styles.completedIconText}>✓</Text>
              </View>
              <View style={styles.completedCopy}>
                <Text style={styles.completedTitle}>Hedef tamamlandı</Text>
                <Text style={styles.completedText}>
                  Devam edebilir veya yeni bir tur başlatabilirsiniz.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.sessionActions}>
            <Pressable
              accessibilityRole="button"
              disabled={selectedSession.count === 0}
              onPress={undo}
              style={({ pressed }) => [
                styles.secondaryButton,
                selectedSession.count === 0 && styles.disabledButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.secondaryButtonText}>Geri al</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={selectedSession.count === 0}
              onPress={() => setResetVisible(true)}
              style={({ pressed }) => [
                styles.secondaryButton,
                selectedSession.count === 0 && styles.disabledButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.secondaryButtonText}>Sıfırla</Text>
            </Pressable>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Dokunuş titreşimi</Text>
              <Text style={styles.settingText}>
                Her sayımda hafif, hedef tamamlanınca belirgin geri bildirim verir.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Dokunuş titreşimi"
              onValueChange={setHapticsEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#C8D1CD', true: '#2B7967' }}
              value={state.hapticsEnabled}
            />
          </View>

          <Text style={styles.statisticsTitle}>İstatistikler</Text>
          <View style={styles.statisticsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.today.total}</Text>
              <Text style={styles.statLabel}>Bugün</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.lastSevenTotal}</Text>
              <Text style={styles.statLabel}>Son 7 gün</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.activeDays}</Text>
              <Text style={styles.statLabel}>Aktif gün</Text>
            </View>
          </View>

          {summary.today.total > 0 && (
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Bugünün dağılımı</Text>
              {DHIKR_PRESETS.filter(
                (preset) => (summary.today.byDhikr[preset.key] ?? 0) > 0,
              ).map((preset) => (
                <View key={preset.key} style={styles.breakdownRow}>
                  <Text style={styles.breakdownName}>{preset.title}</Text>
                  <Text style={styles.breakdownValue}>
                    {summary.today.byDhikr[preset.key]}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.dataNotice}>
            Sayaç ve istatistikler yalnızca bu cihazda saklanır. Hesap veya internet
            bağlantısı gerekmez.
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setCustomTargetVisible(false)}
        transparent
        visible={customTargetVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Özel hedef</Text>
            <Text style={styles.modalText}>1 ile 9999 arasında bir hedef belirleyin.</Text>
            <TextInput
              accessibilityLabel="Özel hedef sayısı"
              autoFocus
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(value) => setCustomTargetValue(value.replace(/\D/g, ''))}
              selectTextOnFocus
              style={styles.targetInput}
              value={customTarget}
            />
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setCustomTargetVisible(false)}
                style={styles.modalSecondaryButton}>
                <Text style={styles.modalSecondaryText}>Vazgeç</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!customTargetValid}
                onPress={applyCustomTarget}
                style={[
                  styles.modalPrimaryButton,
                  !customTargetValid && styles.disabledButton,
                ]}>
                <Text style={styles.modalPrimaryText}>Hedefi uygula</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setResetVisible(false)}
        transparent
        visible={resetVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Oturum sıfırlansın mı?</Text>
            <Text style={styles.modalText}>
              {selectedPreset.title} sayacı sıfırlanacak. Bugünkü toplamınız korunacak.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setResetVisible(false)}
                style={styles.modalSecondaryButton}>
                <Text style={styles.modalSecondaryText}>Vazgeç</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  reset();
                  setResetVisible(false);
                }}
                style={styles.modalDangerButton}>
                <Text style={styles.modalPrimaryText}>Sıfırla</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingScreenText: {
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
    marginTop: 17,
    textTransform: 'capitalize',
  },
  heroStats: {
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.13)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 16,
  },
  heroDivider: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    height: 32,
    marginHorizontal: 28,
    width: StyleSheet.hairlineWidth,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  heroStatLabel: {
    color: '#AFC9C0',
    fontSize: 10,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionLabel: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  presetList: {
    gap: 9,
    paddingBottom: 4,
    paddingTop: 10,
  },
  presetChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E8E4',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  presetChipActive: {
    backgroundColor: '#1A594B',
    borderColor: '#1A594B',
  },
  presetText: {
    color: '#4A5A54',
    fontSize: 12,
    fontWeight: '700',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  presetCount: {
    color: '#80908A',
    fontSize: 10,
    fontWeight: '800',
  },
  presetCountActive: {
    color: '#C7DCD4',
  },
  phraseCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 21,
  },
  arabicPhrase: {
    color: '#174D42',
    fontSize: 30,
    lineHeight: 48,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  phraseTitle: {
    color: '#23342E',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 5,
  },
  phraseMeaning: {
    color: '#71807B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    textAlign: 'center',
  },
  targetHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  targetHint: {
    color: '#84908C',
    fontSize: 9,
  },
  targetOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  targetChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE5E1',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  targetChipActive: {
    backgroundColor: '#DDEDE5',
    borderColor: '#1A594B',
  },
  targetChipText: {
    color: '#64736E',
    fontSize: 12,
    fontWeight: '800',
  },
  targetChipTextActive: {
    color: '#1A594B',
  },
  counterButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#174D42',
    borderColor: '#E9C871',
    borderRadius: 120,
    borderWidth: 8,
    height: 232,
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: '#173E35',
    shadowOffset: { width: 0, height: 11 },
    shadowOpacity: 0.2,
    shadowRadius: 23,
    width: 232,
    elevation: 5,
  },
  counterButtonCompleted: {
    backgroundColor: '#226A58',
    borderColor: '#F1CF82',
  },
  counterButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  counterInstruction: {
    color: '#B8D0C7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  counterValue: {
    color: '#FFFFFF',
    fontSize: 68,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 79,
  },
  counterTarget: {
    color: '#F1CF82',
    fontSize: 12,
    fontWeight: '800',
  },
  progressArea: {
    marginTop: 21,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#566761',
    fontSize: 11,
    fontWeight: '700',
  },
  progressValue: {
    color: '#1A594B',
    fontSize: 11,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: '#DDE5E1',
    borderRadius: 7,
    height: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#1A594B',
    borderRadius: 7,
    height: '100%',
  },
  completedCard: {
    alignItems: 'center',
    backgroundColor: '#FFF3D4',
    borderColor: '#E9D394',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    padding: 14,
  },
  completedIcon: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    marginRight: 11,
    width: 34,
  },
  completedIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  completedCopy: {
    flex: 1,
  },
  completedTitle: {
    color: '#5C491D',
    fontSize: 13,
    fontWeight: '900',
  },
  completedText: {
    color: '#786B49',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D6E0DB',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#35554B',
    fontSize: 12,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  settingCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 16,
    padding: 16,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 14,
  },
  settingTitle: {
    color: '#2A3B35',
    fontSize: 13,
    fontWeight: '800',
  },
  settingText: {
    color: '#798680',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  statisticsTitle: {
    color: '#1C2A26',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 24,
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
    paddingVertical: 15,
  },
  statValue: {
    color: '#174D42',
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#7D8985',
    fontSize: 9,
    marginTop: 3,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 12,
    padding: 16,
  },
  breakdownTitle: {
    color: '#35463F',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
  },
  breakdownRow: {
    alignItems: 'center',
    borderBottomColor: '#E8EEEA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 37,
  },
  breakdownName: {
    color: '#60706A',
    fontSize: 11,
  },
  breakdownValue: {
    color: '#1A594B',
    fontSize: 12,
    fontWeight: '900',
  },
  dataNotice: {
    color: '#84918D',
    fontSize: 10,
    lineHeight: 16,
    marginHorizontal: 15,
    marginTop: 18,
    textAlign: 'center',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(13,37,31,0.56)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    maxWidth: 390,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    color: '#20332C',
    fontSize: 19,
    fontWeight: '900',
  },
  modalText: {
    color: '#70807A',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  targetInput: {
    backgroundColor: '#F1F4F2',
    borderColor: '#D8E2DD',
    borderRadius: 14,
    borderWidth: 1,
    color: '#183D33',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalSecondaryButton: {
    alignItems: 'center',
    borderColor: '#C9D5D0',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  modalSecondaryText: {
    color: '#52655E',
    fontSize: 12,
    fontWeight: '800',
  },
  modalPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 13,
    flex: 1.35,
    paddingVertical: 12,
  },
  modalDangerButton: {
    alignItems: 'center',
    backgroundColor: '#8B493D',
    borderRadius: 13,
    flex: 1,
    paddingVertical: 12,
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.74,
  },
});
