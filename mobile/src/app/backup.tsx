import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import {
  exportBackup,
  formatSize,
  getBackupStats,
  getKeyLabel,
  restoreBackup,
  type BackupStats,
} from '@/services/backup';

export default function BackupScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    getBackupStats().then(setStats);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBackup();
    } catch (e) {
      Alert.alert('Hata', 'Yedek dışa aktarılırken bir sorun oluştu.');
    } finally {
      setExporting(false);
    }
  };

  const handleRestore = async () => {
    if (!importText.trim()) return;
    Alert.alert(
      'Veri geri yükleme',
      'Mevcut verilerinizin üzerine yedek verisi yazılacak. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Geri yükle',
          style: 'destructive',
          onPress: async () => {
            setRestoring(true);
            const result = await restoreBackup(importText.trim());
            setRestoring(false);
            if (result.success) {
              setRestoreResult({
                success: true,
                message: `${result.restoredKeys.length} veri kategorisi başarıyla geri yüklendi.`,
              });
              setImportText('');
              setImportMode(false);
              const newStats = await getBackupStats();
              setStats(newStats);
            } else {
              setRestoreResult({ success: false, message: result.error ?? 'Bilinmeyen hata.' });
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>‹ Geri</Text>
              </Pressable>
            </View>
            <Text style={styles.eyebrow}>MIHRAB · VERİ</Text>
            <Text style={styles.heroTitle}>Yedekleme ve senkronizasyon</Text>
            <Text style={styles.heroSub}>
              Tüm namaz verilerini, istatistiklerini ve ayarlarını dışa aktar. Yeni cihaza taşımak veya yedek almak için kullan.
            </Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>

          {/* ── Current data ── */}
          <Text style={styles.sectionLabel}>MEVCUT VERİ</Text>
          <View style={styles.dataCard}>
            {stats ? (
              <>
                {stats.keys.map((key) => (
                  <View key={key} style={styles.dataRow}>
                    <View style={styles.dataIcon}>
                      <Text style={styles.dataIconText}>✓</Text>
                    </View>
                    <Text style={styles.dataLabel}>{getKeyLabel(key)}</Text>
                  </View>
                ))}
                {stats.keys.length === 0 && (
                  <Text style={styles.emptyText}>Henüz kaydedilmiş veri yok.</Text>
                )}
                {stats.keys.length > 0 && (
                  <View style={styles.sizeRow}>
                    <Text style={styles.sizeLabel}>Toplam yedek boyutu</Text>
                    <Text style={styles.sizeValue}>{formatSize(stats.sizeBytes)}</Text>
                  </View>
                )}
              </>
            ) : (
              <ActivityIndicator color="#1A594B" />
            )}
          </View>

          {/* ── Export ── */}
          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>DIŞA AKTAR</Text>
          <View style={styles.exportCard}>
            <Text style={styles.exportTitle}>JSON yedek dosyası</Text>
            <Text style={styles.exportDesc}>
              Tüm veriler tek bir JSON dosyasına paketlenir. Cihazınızın Paylaş menüsünden Dosyalar, e-posta veya bulut depolama uygulamalarına kaydedebilirsiniz.
            </Text>
            <Pressable
              onPress={handleExport}
              disabled={exporting || !stats || stats.keys.length === 0}
              style={({ pressed }) => [styles.exportBtn, (exporting || !stats || stats.keys.length === 0) && styles.btnDisabled, pressed && styles.pressed]}>
              {exporting
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.exportBtnText}>↑  Yedeği dışa aktar</Text>
              }
            </Pressable>
          </View>

          {/* ── Import ── */}
          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>İÇE AKTAR</Text>
          <View style={styles.importCard}>
            <Text style={styles.importTitle}>Yedekten geri yükle</Text>
            <Text style={styles.importDesc}>
              Daha önce dışa aktardığınız JSON yedek dosyasının içeriğini aşağıya yapıştırın.
            </Text>

            {restoreResult && (
              <View style={[styles.resultBanner, restoreResult.success ? styles.resultSuccess : styles.resultError]}>
                <Text style={[styles.resultText, restoreResult.success ? styles.resultTextSuccess : styles.resultTextError]}>
                  {restoreResult.success ? '✓  ' : '✕  '}{restoreResult.message}
                </Text>
              </View>
            )}

            {!importMode ? (
              <Pressable
                onPress={() => { setImportMode(true); setRestoreResult(null); }}
                style={({ pressed }) => [styles.importToggleBtn, pressed && styles.pressed]}>
                <Text style={styles.importToggleBtnText}>↓  JSON yapıştır ve geri yükle</Text>
              </Pressable>
            ) : (
              <>
                <TextInput
                  value={importText}
                  onChangeText={setImportText}
                  multiline
                  numberOfLines={6}
                  placeholder={'{\n  "app": "MIHRAB",\n  "version": "1.0",\n  ...\n}'}
                  placeholderTextColor="#AAB8B3"
                  style={styles.importInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.importActions}>
                  <Pressable
                    onPress={() => { setImportMode(false); setImportText(''); setRestoreResult(null); }}
                    style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}>
                    <Text style={styles.cancelBtnText}>İptal</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleRestore}
                    disabled={restoring || !importText.trim()}
                    style={({ pressed }) => [styles.restoreBtn, (!importText.trim() || restoring) && styles.btnDisabled, pressed && styles.pressed]}>
                    {restoring
                      ? <ActivityIndicator color="#FFFFFF" size="small" />
                      : <Text style={styles.restoreBtnText}>Geri yükle</Text>
                    }
                  </Pressable>
                </View>
              </>
            )}
          </View>

          {/* ── Info ── */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Bulut senkronizasyonu</Text>
            <Text style={styles.infoText}>
              Google Drive veya iCloud otomatik senkronizasyonu gelecek sürümlerde eklenecek. Şu an JSON dışa aktarma ile verilerinizi güvende tutabilirsiniz.
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6F2' },
  scroll: { paddingBottom: 125 },
  hero: { backgroundColor: '#123E36', borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' },
  heroSafe: { paddingBottom: 28, paddingHorizontal: 20 },
  topBar: { paddingTop: 8 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10, alignSelf: 'flex-start' },
  backText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  eyebrow: { color: '#F1CF82', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 25 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 6 },
  heroSub: { color: '#BBD0C8', fontSize: 13, lineHeight: 20, marginTop: 7 },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: { color: '#1D6555', fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginBottom: 10 },
  dataCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16 },
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomColor: '#E8EEE9', borderBottomWidth: StyleSheet.hairlineWidth },
  dataIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DDEDE5', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  dataIconText: { color: '#1C6957', fontSize: 10, fontWeight: '900' },
  dataLabel: { color: '#2B3B35', fontSize: 13, fontWeight: '700' },
  emptyText: { color: '#71807A', fontSize: 12, textAlign: 'center', paddingVertical: 12 },
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopColor: '#E8EEE9', borderTopWidth: StyleSheet.hairlineWidth },
  sizeLabel: { color: '#81908A', fontSize: 10, fontWeight: '800' },
  sizeValue: { color: '#1A594B', fontSize: 13, fontWeight: '900' },
  exportCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18 },
  exportTitle: { color: '#20312B', fontSize: 15, fontWeight: '900' },
  exportDesc: { color: '#71807A', fontSize: 11, lineHeight: 17, marginTop: 6 },
  exportBtn: { backgroundColor: '#1A594B', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 14, minHeight: 46 },
  exportBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  btnDisabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
  importCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18 },
  importTitle: { color: '#20312B', fontSize: 15, fontWeight: '900' },
  importDesc: { color: '#71807A', fontSize: 11, lineHeight: 17, marginTop: 6 },
  resultBanner: { borderRadius: 12, padding: 12, marginTop: 12 },
  resultSuccess: { backgroundColor: '#DDF2E7' },
  resultError: { backgroundColor: '#FDEAEA' },
  resultText: { fontSize: 11, fontWeight: '700', lineHeight: 16 },
  resultTextSuccess: { color: '#1A594B' },
  resultTextError: { color: '#C0392B' },
  importToggleBtn: { borderWidth: 1.5, borderColor: '#1A594B', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 14, minHeight: 46 },
  importToggleBtnText: { color: '#1A594B', fontSize: 13, fontWeight: '900' },
  importInput: { borderWidth: 1.5, borderColor: '#D0DDD8', borderRadius: 14, padding: 12, marginTop: 12, fontSize: 10, fontFamily: 'monospace', color: '#2B3B35', minHeight: 110, textAlignVertical: 'top' },
  importActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#D0DDD8', borderRadius: 13, alignItems: 'center', justifyContent: 'center', minHeight: 42 },
  cancelBtnText: { color: '#4A5E57', fontSize: 12, fontWeight: '800' },
  restoreBtn: { flex: 2, backgroundColor: '#C0392B', borderRadius: 13, alignItems: 'center', justifyContent: 'center', minHeight: 42 },
  restoreBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  infoCard: { backgroundColor: '#FFF5E4', borderRadius: 19, marginTop: 17, padding: 17 },
  infoTitle: { color: '#6E5423', fontSize: 14, fontWeight: '900' },
  infoText: { color: '#7D6A43', fontSize: 11, lineHeight: 17, marginTop: 6 },
});
