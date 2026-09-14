import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '@/hooks/use-language';
import { type Language } from '@/services/language';

const LANGUAGE_OPTIONS: { code: Language; native: string; label: string }[] = [
  { code: 'tr', native: 'Türkçe', label: 'Türkçe' },
  { code: 'en', native: 'English', label: 'English' },
  { code: 'ar', native: 'العربية', label: 'Arabic' },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { current, changeLanguage } = useLanguage();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>{t('language.eyebrow')}</Text>
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>

          <View style={styles.optionsCard}>
            {LANGUAGE_OPTIONS.map((option, index) => {
              const isSelected = current === option.code;
              const isLast = index === LANGUAGE_OPTIONS.length - 1;
              return (
                <TouchableOpacity
                  key={option.code}
                  style={[styles.optionRow, isLast && styles.optionRowLast]}
                  onPress={() => changeLanguage(option.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionNative}>{option.native}</Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedText}>{t('language.selected')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.note}>{t('language.note')}</Text>
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
    paddingBottom: 125,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  eyebrow: {
    color: '#1D6555',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.9,
  },
  title: {
    color: '#182723',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 7,
  },
  subtitle: {
    color: '#64736E',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 26,
    paddingHorizontal: 16,
  },
  optionRow: {
    alignItems: 'center',
    borderBottomColor: '#E7EDE9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 12,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  optionNative: {
    color: '#1E2E29',
    fontSize: 17,
    fontWeight: '700',
  },
  selectedBadge: {
    backgroundColor: '#DDEEE6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  selectedText: {
    color: '#1A6048',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#B5C5BE',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSelected: {
    borderColor: '#1D6555',
  },
  radioDot: {
    backgroundColor: '#1D6555',
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  note: {
    color: '#8A9C96',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
    textAlign: 'center',
  },
});
