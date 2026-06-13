# Diyanet Entegrasyonu

## Güncel durum

MIHRAB, Türkiye aşamasında Diyanet İşleri Başkanlığının resmî namaz vakitleri sitesini
kullanır.

- 81 il doğrulandı.
- Diyanet'in Türkiye için tanımladığı 869 ilçe/vakit bölgesi doğrulandı.
- Telefon konumu il ve ilçe adlarına dönüştürülür.
- İsimler Diyanet'in resmî il/ilçe listesiyle eşleştirilir.
- İlçe için ayrı bölge yoksa Diyanet'in il merkezi bölgesi kullanılır.
- Son başarılı günlük veri cihazda saklanır.
- Kullanıcı il ve ilçeyi elle değiştirebilir.
- Web önizlemesinde Diyanet istekleri aynı alan adındaki `/api/diyanet` katmanından geçer.
- Web konumu, kullanıcının izin verdiği güncel koordinatlarla BigDataCloud istemci API'sinde şehir ve ilçe adına dönüştürülür.
- Mobilde cihazın yerel konum servisi kullanılır.

## Üretim mimarisi

Diyanet'in yetkili Awqat Salah REST API servisi kullanıcı adı ve şifre gerektirir. Bu
bilgiler Diyanet başvurusu sonucunda verilir ve mobil uygulamanın içine gömülmemelidir.

Yayın öncesinde hedef mimari:

1. Diyanet API erişimi için resmî başvuru
2. Kimlik bilgilerinin MIHRAB sunucusunda saklanması
3. Mobil uygulamanın yalnızca MIHRAB sunucusuyla konuşması
4. Önbellek, hız sınırı ve servis kesintisi yönetimi

Mevcut sağlayıcı ayrı bir servis katmanındadır. Yetkili API erişimi geldiğinde ekranlar ve
konum akışı değiştirilmeden veri sağlayıcısı değiştirilebilir.

## Kaynaklar

- Diyanet Namaz Vakitleri: https://namazvakitleri.diyanet.gov.tr/
- Diyanet Awqat Salah REST API: https://awqatsalah.diyanet.gov.tr/
