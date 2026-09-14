import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  type FamilyGroup,
  type FamilyMember,
  PRAYER_NAMES,
  addMember,
  createFamily,
  getFamily,
  getTodayCount,
  getWeeklyCount,
  removeMember,
  togglePrayer,
  getTodayKey,
} from '@/services/family';

function Avatar({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={[styles.avatar, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

function PrayerDots({
  member,
  onToggle,
}: {
  member: FamilyMember;
  onToggle: (index: number) => void;
}) {
  const today = getTodayKey();
  const log = member.prayerLog[today] ?? [false, false, false, false, false];
  return (
    <View style={styles.dots}>
      {PRAYER_NAMES.map((name, i) => (
        <Pressable key={name} onPress={() => onToggle(i)} style={styles.dotWrap}>
          <View style={[styles.dot, log[i] && { backgroundColor: member.avatarColor }]} />
          <Text style={styles.dotLabel}>{name.slice(0, 3)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function MemberCard({
  member,
  isAdmin,
  onToggle,
  onRemove,
}: {
  member: FamilyMember;
  isAdmin: boolean;
  onToggle: (index: number) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const todayCount = getTodayCount(member);
  const weeklyCount = getWeeklyCount(member);

  return (
    <View style={styles.memberCard}>
      <View style={styles.memberTop}>
        <Avatar name={member.name} color={member.avatarColor} />
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            {member.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>{t('family.admin')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberStats}>
            {t('family.todayCount', { count: todayCount })} · {t('family.weeklyCount', { count: weeklyCount })}
          </Text>
        </View>
        {isAdmin && member.role !== 'admin' && (
          <Pressable onPress={onRemove} hitSlop={10}>
            <Text style={styles.removeBtn}>✕</Text>
          </Pressable>
        )}
      </View>
      <PrayerDots member={member} onToggle={onToggle} />
    </View>
  );
}

export default function FamilyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    getFamily().then((f) => {
      setFamily(f);
      setLoading(false);
      if (!f) setShowSetup(true);
    });
  }, []);

  const handleCreateFamily = useCallback(async () => {
    if (!familyName.trim() || !adminName.trim()) return;
    const f = await createFamily(familyName.trim(), adminName.trim());
    setFamily(f);
    setShowSetup(false);
  }, [familyName, adminName]);

  const handleAddMember = useCallback(async () => {
    if (!family || !newMemberName.trim()) return;
    const f = await addMember(family, newMemberName.trim());
    setFamily(f);
    setNewMemberName('');
    setShowAddMember(false);
  }, [family, newMemberName]);

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      if (!family) return;
      Alert.alert(t('family.removeTitle'), t('family.removeConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('family.remove'),
          style: 'destructive',
          onPress: async () => {
            const f = await removeMember(family, memberId);
            setFamily(f);
          },
        },
      ]);
    },
    [family, t],
  );

  const handleToggle = useCallback(
    async (memberId: string, prayerIndex: number) => {
      if (!family) return;
      const f = await togglePrayer(family, memberId, prayerIndex);
      setFamily(f);
    },
    [family],
  );

  if (loading) return <View style={styles.screen} />;

  const totalToday = family
    ? family.members.reduce((sum, m) => sum + getTodayCount(m), 0)
    : 0;
  const maxToday = family ? family.members.length * 5 : 0;
  const pct = maxToday > 0 ? Math.round((totalToday / maxToday) * 100) : 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{family?.name ?? t('family.title')}</Text>
          {family && (
            <Pressable onPress={() => setShowAddMember(true)} hitSlop={12}>
              <Text style={styles.addBtn}>+</Text>
            </Pressable>
          )}
        </View>

        {family ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statsLabel}>{t('family.todayProgress')}</Text>
                  <Text style={styles.statsValue}>{totalToday} / {maxToday}</Text>
                </View>
                <Text style={styles.statsPct}>{pct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
              </View>
              <Text style={styles.statsHint}>
                {t('family.memberCount', { count: family.members.length })}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>{t('family.members')}</Text>
            {family.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={family.members[0]?.role === 'admin'}
                onToggle={(i) => handleToggle(member.id, i)}
                onRemove={() => handleRemoveMember(member.id)}
              />
            ))}

            <View style={styles.tipCard}>
              <Text style={styles.tipLabel}>{t('family.tipLabel')}</Text>
              <Text style={styles.tipText}>{t('family.tipText')}</Text>
            </View>
          </ScrollView>
        ) : null}

        {/* Setup Modal */}
        <Modal visible={showSetup} animationType="slide" transparent>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{t('family.setupTitle')}</Text>
              <Text style={styles.sheetSubtitle}>{t('family.setupSubtitle')}</Text>
              <Text style={styles.inputLabel}>{t('family.familyName')}</Text>
              <TextInput
                style={styles.input}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder={t('family.familyNamePlaceholder')}
                placeholderTextColor="#9AABA5"
              />
              <Text style={styles.inputLabel}>{t('family.yourName')}</Text>
              <TextInput
                style={styles.input}
                value={adminName}
                onChangeText={setAdminName}
                placeholder={t('family.yourNamePlaceholder')}
                placeholderTextColor="#9AABA5"
              />
              <Pressable
                style={[styles.primaryBtn, (!familyName.trim() || !adminName.trim()) && styles.primaryBtnDisabled]}
                onPress={handleCreateFamily}
              >
                <Text style={styles.primaryBtnText}>{t('family.create')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Add Member Modal */}
        <Modal visible={showAddMember} animationType="slide" transparent>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{t('family.addMemberTitle')}</Text>
              <Text style={styles.inputLabel}>{t('family.memberName')}</Text>
              <TextInput
                style={styles.input}
                value={newMemberName}
                onChangeText={setNewMemberName}
                placeholder={t('family.memberNamePlaceholder')}
                placeholderTextColor="#9AABA5"
                autoFocus
              />
              <Pressable
                style={[styles.primaryBtn, !newMemberName.trim() && styles.primaryBtnDisabled]}
                onPress={handleAddMember}
              >
                <Text style={styles.primaryBtnText}>{t('family.addMember')}</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddMember(false)}>
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  backBtn: {},
  backText: { color: '#FFFFFF', fontSize: 28, lineHeight: 32 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  addBtn: { color: '#F1CF82', fontSize: 26, fontWeight: '300' },
  content: { paddingBottom: 120, paddingHorizontal: 20 },
  statsCard: {
    backgroundColor: '#123E36',
    borderRadius: 22,
    marginBottom: 24,
    padding: 20,
  },
  statsRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statsLabel: { color: '#AFC9C0', fontSize: 12 },
  statsValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 3 },
  statsPct: { color: '#F1CF82', fontSize: 28, fontWeight: '800' },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    height: 6,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: '#F1CF82', borderRadius: 8, height: '100%' },
  statsHint: { color: '#7BA89E', fontSize: 11, marginTop: 10 },
  sectionTitle: { color: '#AFC9C0', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  memberCard: {
    backgroundColor: '#1A3D30',
    borderRadius: 18,
    marginBottom: 12,
    padding: 16,
  },
  memberTop: { alignItems: 'center', flexDirection: 'row', marginBottom: 14 },
  avatar: { alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#FFFFFF', fontWeight: '800' },
  memberInfo: { flex: 1 },
  memberNameRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  memberName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  adminBadge: { backgroundColor: 'rgba(241,207,130,0.2)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  adminBadgeText: { color: '#F1CF82', fontSize: 9, fontWeight: '800' },
  memberStats: { color: '#7BA89E', fontSize: 11, marginTop: 3 },
  removeBtn: { color: '#7BA89E', fontSize: 16 },
  dots: { flexDirection: 'row', gap: 8 },
  dotWrap: { alignItems: 'center', flex: 1 },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    height: 28,
    marginBottom: 4,
    width: '100%',
  },
  dotLabel: { color: '#5E7A72', fontSize: 9, fontWeight: '700' },
  tipCard: {
    backgroundColor: '#1A3028',
    borderRadius: 16,
    marginTop: 8,
    padding: 16,
  },
  tipLabel: { color: '#5E8E7A', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  tipText: { color: '#7BA89E', fontSize: 12, lineHeight: 18, marginTop: 6 },
  overlay: { backgroundColor: 'rgba(0,0,0,0.7)', flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0F2D22',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 48,
  },
  sheetTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  sheetSubtitle: { color: '#7BA89E', fontSize: 13, lineHeight: 19, marginBottom: 22 },
  inputLabel: { color: '#AFC9C0', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#1A3D30',
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryBtn: { backgroundColor: '#1D6555', borderRadius: 14, padding: 16 },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  cancelBtn: { marginTop: 12, padding: 12 },
  cancelBtnText: { color: '#7BA89E', fontSize: 14, textAlign: 'center' },
});
