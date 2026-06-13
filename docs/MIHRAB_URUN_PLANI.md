# MIHRAB Ürün Planı

Bu belge, `MIHRAB_Nihai_Yol_Haritasi.docx` dosyasındaki kararların çalışan projeye
uyarlanmış ana planıdır. Kapsam veya öncelik konusunda çelişki oluşursa nihai yol haritası
esas alınır.

## 1. Ürün Vizyonu

MIHRAB; namaz vakitleri, kıble ve günlük ibadet araçlarını tek bir sade, güvenilir ve modern
uygulamada birleştiren İslami yaşam uygulamasıdır.

- Marka: **MIHRAB**
- Ürün adı: **MIHRAB - Namaz Vakitleri ve Kıble**
- Platformlar: Android ve iOS
- İlk mağaza hedefi: Google Play
- Ana ilke: doğruluk, sadelik, gizlilik ve ibadet anına saygı

## 2. Tamamlanan Özellikler

- [x] Konuma göre namaz vakitleri
- [x] Namaz vakti bildirimleri
- [x] Kıble pusulası
- [x] Günlük ayet sistemi
- [x] Günlük hadis sistemi
- [x] Zikir sayacı
- [x] Namaz takibi

Toplam yayın kapsamı 32 ana hedeftir. Şu anda 7 hedef tamamlanmıştır.

## 3. Yayın Öncesi Zorunlu Hedefler

Belgedeki numaralar korunmuştur. Aşağıdaki gruplar yalnızca uygulama geliştirmesini daha
kolay yönetmek için oluşturulmuştur; hiçbir hedef yayın sonrasına ertelenmiş sayılmaz.

### Aşama 1 - İçerik ve Temel İbadet Araçları

1. [x] Günlük ayet sistemi
2. [x] Günlük hadis sistemi
3. [x] Zikir sayacı
4. [x] Namaz takibi
5. [ ] Kaza namazı takibi
6. [ ] Dua kütüphanesi
7. [ ] Favori dualar
8. [ ] Kur'an-ı Kerim modülü

### Aşama 2 - Takvim, Konum ve Günlük Kullanım

9. [ ] Hicri takvim
10. [ ] Dini günler ve geceler
11. [ ] Ramazan imsakiyesi
12. [ ] Yakındaki camiler
13. [ ] Otomatik sessiz mod
14. [ ] Ana ekran widget'ı

### Aşama 3 - Dil, Zeka, Üyelik ve Topluluk

15. [ ] Türkçe dil desteği
16. [ ] İngilizce dil desteği
17. [ ] Arapça dil desteği
18. [ ] MIHRAB AI
19. [ ] Premium üyelik sistemi
20. [ ] Aile / Cemaat sistemi
21. [ ] Gelişmiş istatistikler
22. [ ] Yeni nesil widget sistemi
23. [ ] Kullanıcı profil sistemi
24. [ ] Veri yedekleme ve senkronizasyon

### Aşama 4 - Hukuk, Yayın ve Kalite

25. [ ] KVKK ve gizlilik politikaları
26. [ ] Google Play yayın hazırlıkları
27. [ ] Performans ve güvenlik testleri
28. [ ] Pil tüketimi optimizasyonu
29. [ ] Bildirim ve konum doğruluk testleri

## 4. Yayına Çıkış Kriteri

MIHRAB ancak aşağıdaki koşulların tamamı karşılandığında genel yayına çıkacaktır:

- [ ] Yukarıdaki tüm hedeflerin yüzde 100 tamamlanması
- [ ] Kritik hata bulunmaması
- [ ] 20 kişilik kapalı testin tamamlanması
- [ ] 100 kişilik beta testin tamamlanması
- [ ] Tüm geri bildirimlerin işlenmesi
- [ ] Google Play yayın paketinin hazır olması

## 5. Yayın Sonrası Strateji

Yayın sonrasında yeni temel özellik eklenmeyecektir. Odak noktası:

- Mevcut sistemlerin geliştirilmesi
- Performans ve pil tüketimi optimizasyonu
- Güvenlik ve kararlılık iyileştirmeleri
- Yeni ve doğrulanmış içerikler
- Kullanıcı deneyiminin iyileştirilmesi

## 6. Teknik Çerçeve

- Mobil uygulama: React Native + Expo
- Dil: TypeScript
- Yönlendirme: Expo Router
- Android paket adı: `com.ezgic.mihrab`
- iOS bundle kimliği: `com.ezgic.mihrab`
- Namaz vakitleri: Diyanet verisi
- Günlük ayet: Kur'an Mealleri Ansiklopedisi API'si, Türkçe Rowad tercümesi
- Günlük hadis: Hadis Tercüme Ansiklopedisi API'si, Türkçe veri sürümü 1.54.0
- Zikir sayacı: cihaz içi kalıcı kayıt ve isteğe bağlı `expo-haptics` dokunuş geri bildirimi
- Namaz takibi: Diyanet vakitleriyle durum gösterimi ve 365 günlük cihaz içi eda geçmişi
- Temel ayarlar ve çevrimdışı veriler: cihaz içi saklama
- Hesap, premium, aile ve senkronizasyon aşamaları: güvenli backend gerektirir

## 7. Geliştirme İlkeleri

1. Kaynağı doğrulanmamış ayet, hadis veya dini içerik yayımlanmaz.
2. Konum ve sensör verileri yalnız gerekli özellikler için kullanılır.
3. Kullanıcıdan izin, özelliği kullanacağı anda ve nedeni açıklanarak istenir.
4. Her özellik Android ve iOS davranışlarıyla birlikte test edilir.
5. Kritik özelliklerde çevrimdışı ve hata durumları ayrıca ele alınır.
6. Tamamlandı işareti ancak kod, arayüz ve doğrulama testleri birlikte bittiğinde verilir.

## 8. Güncel Odak

Sıradaki geliştirme sırası:

1. Kaza namazı takibi
2. Dua kütüphanesi
3. Favori dualar

Namaz takip sistemi Sabah, Öğle, İkindi, Akşam ve Yatsı namazlarını Diyanet saatleriyle
birlikte gösterir. Her namaz tek dokunuşla kılındı olarak işaretlenebilir ve aynı dokunuşla geri
alınabilir. Günlük ilerleme, son yedi gündeki toplam, tam gün sayısı ve kesintisiz tam gün serisi
hesaplanır. Kayıtlar 365 gün boyunca yalnızca cihazda saklanır; yeni günde bugünün takibi
otomatik olarak boş başlarken geçmiş korunur. Bu bölüm eda takibidir, kaza kayıtları ayrı
sistemde ele alınacaktır.

Zikir sayacı altı hazır zikir, zikir başına bağımsız oturum, 33/99/100 veya özel hedef,
isteğe bağlı dokunuş titreşimi, geri alma ve sıfırlama kontrolleri sunar. Günlük toplam,
tamamlanan tur, son yedi gün ve aktif gün istatistikleri cihazda saklanır. Oturum sayaçları
Türkiye tarihine göre yeni günde sıfırlanırken son 30 günlük geçmiş korunur; veriler cihazdan
çıkmaz.

Günlük hadis sistemi Türkiye tarihine göre her gün sabit bir sahih veya hasen hadis seçer.
Türkçe ve Arapça metin, sıhhat derecesi, rivayet nispeti, açıklama, dersler, eser ve hadis
numaraları ile kaynak sürümü birlikte saklanır. Bugünün hadisi ve sonraki yedi günlük içerik
çevrimdışı kullanım için cihazda önbelleğe alınır; ilk açılışta bağlantı yoksa kaynak
bilgileriyle birlikte uygulamadaki yedek hadis gösterilir.

Günlük ayet sistemi Türkiye tarihine göre her gün sabit bir ayet seçer. Arapça metin,
Türkçe meal, sure ve ayet numarası, kaynak bağlantısı ve kaynak sürümü birlikte saklanır.
Bugünün ayeti ile sonraki yedi günün içeriği çevrimdışı kullanım için cihazda önbelleğe
alınır; ilk açılışta bağlantı yoksa kaynak bilgisiyle birlikte uygulamadaki yedek ayet
gösterilir.
