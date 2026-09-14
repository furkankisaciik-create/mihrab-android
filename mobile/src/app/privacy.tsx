import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type Section = { title: string; body: string };

const SECTIONS: Section[] = [
  {
    title: '1. Veri Sorumlusu',
    body: 'MIHRAB uygulaması ("Uygulama"), kişisel verileriniz bakımından 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmektedir. Uygulamaya ilişkin sorularınız için iletişim bölümündeki adrese başvurabilirsiniz.',
  },
  {
    title: '2. Toplanan Veriler',
    body: 'Uygulama yalnızca cihazınızda yerel olarak çalışır; verileriniz herhangi bir uzak sunucuya aktarılmaz.\n\n• Konum: Namaz vakitlerini hesaplamak amacıyla şehir/ilçe bilgisi alınır. Kesin konum (GPS koordinatları) cihazda saklanmaz.\n\n• Namaz takibi: Kılınan namazlar ve kaza namazı kayıtları yalnızca cihazınızdaki AsyncStorage\'a yazılır.\n\n• Kullanıcı profili: Seçtiğiniz isim ve avatar rengi yalnızca cihazınızda saklanır.\n\n• Zikir sayacı, Kuran ilerlemesi, favori dualar: Tüm bu veriler cihazınızda tutulur.\n\n• Dil ve widget ayarları: Cihazınızda saklanır.',
  },
  {
    title: '3. Kullanılan Dış Hizmetler',
    body: 'Uygulama; namaz vakitlerini almak için Diyanet İşleri Başkanlığı\'na ait açık API\'yi kullanır. Bu API\'ye yalnızca seçtiğiniz il/ilçe kodu iletilir; kimliğinizi tanımlayan herhangi bir veri paylaşılmaz.\n\nYakındaki camileri bulmak için Google Maps hizmetinden yararlanılır. Bu özellik kullandığınızda cihazınızın konumu Google\'a iletilir; Google\'ın gizlilik politikası geçerlidir.',
  },
  {
    title: '4. İzinler',
    body: '• Konum (Yaklaşık): Şehir/ilçe tespiti için kullanılır; yalnızca namaz vakti sorgusu sırasında aktif olur.\n\n• Bildirimler: Namaz vakti hatırlatmaları için kullanılır. Bildirimlere izin vermezseniz bu özellik çalışmaz; diğer tüm işlevler etkilenmez.',
  },
  {
    title: '5. Veri Güvenliği',
    body: 'Verileriniz cihazınızın yerel depolama alanında (AsyncStorage) tutulur. Telefonunuzun kilit ekranı ve şifreleme özellikleri bu verileri de korur. Uygulama, verilerinizi üçüncü taraflarla paylaşmaz, satmaz veya reklam amacıyla kullanmaz.',
  },
  {
    title: '6. KVKK Kapsamındaki Haklarınız',
    body: 'KVKK madde 11 uyarınca;\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme,\n• İşlenmişse bilgi talep etme,\n• Amaç ve amaca uygunluğunu öğrenme,\n• Yurt içi/yurt dışı aktarım bilgilerini öğrenme,\n• Eksik ya da yanlış işlenmişse düzeltilmesini isteme,\n• Silinmesini veya yok edilmesini isteme,\n• İşlemeye itiraz etme\nhaklarına sahipsiniz.\n\nBu hakları kullanmak için uygulamayı kaldırabilir ya da Ayarlar > Uygulama > MIHRAB yolundan verileri temizleyebilirsiniz. Ayrıca iletişim adresimizden yazılı başvuruda bulunabilirsiniz.',
  },
  {
    title: '7. Çerezler ve Analitik',
    body: 'Uygulama herhangi bir çerez, izleme pikseli veya kullanım analitik aracı (Firebase Analytics, Mixpanel vb.) kullanmamaktadır.',
  },
  {
    title: '8. Çocukların Gizliliği',
    body: 'Uygulama, 13 yaşın altındaki çocuklara yönelik kişisel veri toplamamaktadır.',
  },
  {
    title: '9. Politika Güncellemeleri',
    body: 'Bu politika gerektiğinde güncellenebilir. Önemli değişiklikler uygulama içi bildirimle duyurulacaktır. Güncel politika her zaman bu ekranda erişilebilir olacaktır.',
  },
  {
    title: '10. İletişim',
    body: 'KVKK kapsamındaki başvurularınız ve gizlilik sorularınız için: mihrab.app@proton.me\n\nBaşvurularınız 30 gün içinde yanıtlanacaktır.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>‹ Geri</Text>
              </Pressable>
            </View>
            <Text style={styles.eyebrow}>MIHRAB · KVKK</Text>
            <Text style={styles.heroTitle}>Gizlilik politikası</Text>
            <Text style={styles.heroSub}>Son güncelleme: Eylül 2025</Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Kısa özet</Text>
            <View style={styles.summaryRows}>
              {[
                ['🔒', 'Verileriniz yalnızca cihazınızda saklanır'],
                ['🚫', 'Uzak sunucuya veri aktarımı yok'],
                ['📍', 'Konum yalnızca şehir/ilçe tespiti için kullanılır'],
                ['🔔', 'Bildirimler yalnızca namaz vakitleri için'],
                ['📊', 'Analitik veya reklam takibi yok'],
              ].map(([icon, text]) => (
                <View key={text} style={styles.summaryRow}>
                  <Text style={styles.summaryIcon}>{icon}</Text>
                  <Text style={styles.summaryText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}
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
  heroSub: { color: '#BBD0C8', fontSize: 12, marginTop: 6 },
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 14 },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18 },
  summaryTitle: { color: '#1A594B', fontSize: 13, fontWeight: '900', marginBottom: 12 },
  summaryRows: { gap: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  summaryIcon: { fontSize: 14 },
  summaryText: { flex: 1, color: '#2B3B35', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16 },
  sectionTitle: { color: '#1A594B', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  sectionBody: { color: '#495A54', fontSize: 11, lineHeight: 18 },
});
