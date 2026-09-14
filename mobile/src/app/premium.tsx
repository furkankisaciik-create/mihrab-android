import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import i18n from '@/i18n';
import {
  PREMIUM_FEATURES,
  PREMIUM_PRICES,
  type PremiumPlan,
  getPremiumStatus,
  setPremiumStatus,
} from '@/services/premium';

const FEATURE_KEYS = [
  'ai_unlimited',
  'advanced_stats',
  'family',
  'cloud_sync',
  'themes',
  'custom_adhan',
] as const;

export default function PremiumScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = (i18n.language ?? 'tr') as 'tr' | 'en' | 'ar';

  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>('yearly');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    getPremiumStatus().then((s) => setIsPremium(s.active));
  }, []);

  const purchase = useCallback(async () => {
    if (!selectedPlan || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const expiresAt = new Date();
    if (selectedPlan === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
    else expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await setPremiumStatus({ active: true, plan: selectedPlan, expiresAt: expiresAt.toISOString() });
    setIsPremium(true);
    setLoading(false);
    setShowSuccess(true);
  }, [selectedPlan, loading]);

  const priceLabel = (plan: 'monthly' | 'yearly') => PREMIUM_PRICES[plan][lang] ?? PREMIUM_PRICES[plan].tr;
  const savingLabel = PREMIUM_PRICES.yearlySaving[lang] ?? PREMIUM_PRICES.yearlySaving.tr;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('premium.badge')}</Text>
            </View>
            <Text style={styles.heroTitle}>{t('premium.heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{t('premium.heroSubtitle')}</Text>
          </View>

          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>{t('premium.featuresTitle')}</Text>
            {PREMIUM_FEATURES.map((f) => (
              <View key={f.key} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>{f.iconTr}</Text>
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureName}>{t(`premium.features.${f.key}.title`)}</Text>
                  <Text style={styles.featureDesc}>{t(`premium.features.${f.key}.desc`)}</Text>
                </View>
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              </View>
            ))}
          </View>

          {!isPremium ? (
            <>
              <Text style={styles.plansTitle}>{t('premium.choosePlan')}</Text>
              <View style={styles.plansRow}>
                <Pressable
                  style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
                  onPress={() => setSelectedPlan('monthly')}>
                  <Text style={[styles.planName, selectedPlan === 'monthly' && styles.planNameSelected]}>
                    {t('premium.monthly')}
                  </Text>
                  <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceSelected]}>
                    {priceLabel('monthly')}
                  </Text>
                  <Text style={[styles.planPer, selectedPlan === 'monthly' && styles.planPerSelected]}>
                    {t('premium.perMonth')}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.planCard, styles.planCardYearly, selectedPlan === 'yearly' && styles.planCardSelected]}
                  onPress={() => setSelectedPlan('yearly')}>
                  <View style={styles.savingBadge}>
                    <Text style={styles.savingText}>{savingLabel}</Text>
                  </View>
                  <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameSelected]}>
                    {t('premium.yearly')}
                  </Text>
                  <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>
                    {priceLabel('yearly')}
                  </Text>
                  <Text style={[styles.planPer, selectedPlan === 'yearly' && styles.planPerSelected]}>
                    {t('premium.perYear')}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.ctaButton, loading && styles.ctaButtonLoading]}
                onPress={purchase}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.ctaText}>{t('premium.subscribe')}</Text>
                )}
              </Pressable>

              <Text style={styles.restoreLink} onPress={() => {}}>
                {t('premium.restore')}
              </Text>
              <Text style={styles.legalNote}>{t('premium.legal')}</Text>
            </>
          ) : (
            <View style={styles.activeCard}>
              <Text style={styles.activeIcon}>✦</Text>
              <Text style={styles.activeTitle}>{t('premium.activeTitle')}</Text>
              <Text style={styles.activeDesc}>{t('premium.activeDesc')}</Text>
              <Pressable style={styles.backBtn} onPress={() => router.back()}>
                <Text style={styles.backBtnText}>{t('premium.back')}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.successModal}>
            <Text style={styles.successIcon}>✦</Text>
            <Text style={styles.successTitle}>{t('premium.successTitle')}</Text>
            <Text style={styles.successDesc}>{t('premium.successDesc')}</Text>
            <Pressable
              style={styles.successBtn}
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}>
              <Text style={styles.successBtnText}>{t('premium.successBtn')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0D2E28' },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 10 },

  heroSection: { alignItems: 'center', paddingVertical: 28 },
  badge: {
    backgroundColor: 'rgba(241,207,130,0.18)',
    borderColor: '#F1CF82',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: { color: '#F1CF82', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', textAlign: 'center', lineHeight: 36 },
  heroSubtitle: { color: '#8ABDB0', fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: 'center' },

  featuresCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 22, padding: 18, marginBottom: 26 },
  featuresTitle: { color: '#C5DDD6', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 14 },
  featureRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 14 },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(241,207,130,0.12)',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  featureIconText: { fontSize: 16 },
  featureCopy: { flex: 1, marginHorizontal: 12 },
  featureName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  featureDesc: { color: '#7BA99E', fontSize: 11, lineHeight: 16, marginTop: 2 },
  checkBadge: {
    alignItems: 'center',
    backgroundColor: '#1A5C4E',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkBadgeText: { color: '#6FD8B0', fontSize: 11, fontWeight: '900' },

  plansTitle: { color: '#C5DDD6', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 12 },
  plansRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'transparent',
    borderRadius: 20,
    borderWidth: 2,
    flex: 1,
    paddingVertical: 18,
  },
  planCardYearly: { position: 'relative' },
  planCardSelected: { backgroundColor: 'rgba(241,207,130,0.12)', borderColor: '#F1CF82' },
  planName: { color: '#8ABDB0', fontSize: 12, fontWeight: '700' },
  planNameSelected: { color: '#F1CF82' },
  planPrice: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 6 },
  planPriceSelected: { color: '#F1CF82' },
  planPer: { color: '#5E8C82', fontSize: 10, marginTop: 3 },
  planPerSelected: { color: '#B8994E' },
  savingBadge: {
    backgroundColor: '#1A5C4E',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  savingText: { color: '#6FD8B0', fontSize: 10, fontWeight: '800' },

  ctaButton: {
    alignItems: 'center',
    backgroundColor: '#F1CF82',
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
  },
  ctaButtonLoading: { opacity: 0.7 },
  ctaText: { color: '#182723', fontSize: 16, fontWeight: '900' },

  restoreLink: { color: '#5E8C82', fontSize: 12, marginTop: 14, textAlign: 'center' },
  legalNote: { color: '#3E6860', fontSize: 10, lineHeight: 15, marginTop: 12, textAlign: 'center' },

  activeCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(111,216,176,0.08)',
    borderColor: '#6FD8B0',
    borderRadius: 22,
    borderWidth: 1,
    padding: 28,
    marginTop: 8,
  },
  activeIcon: { color: '#F1CF82', fontSize: 32, marginBottom: 10 },
  activeTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  activeDesc: { color: '#8ABDB0', fontSize: 13, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  backBtn: {
    backgroundColor: '#1A5C4E',
    borderRadius: 14,
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  backBtnText: { color: '#6FD8B0', fontSize: 14, fontWeight: '800' },

  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  successModal: {
    alignItems: 'center',
    backgroundColor: '#0D2E28',
    borderColor: '#F1CF82',
    borderRadius: 28,
    borderWidth: 1,
    padding: 32,
    width: '100%',
  },
  successIcon: { color: '#F1CF82', fontSize: 40, marginBottom: 14 },
  successTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  successDesc: { color: '#8ABDB0', fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: 'center' },
  successBtn: {
    backgroundColor: '#F1CF82',
    borderRadius: 16,
    marginTop: 24,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  successBtnText: { color: '#182723', fontSize: 15, fontWeight: '900' },
});
