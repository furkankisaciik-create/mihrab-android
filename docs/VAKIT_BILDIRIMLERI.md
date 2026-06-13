# Vakit Bildirimleri

## Davranış

- Bildirim izni yalnızca kullanıcı ana bildirim anahtarını açtığında istenir.
- İmsak, Güneş, Öğle, İkindi, Akşam ve Yatsı ayrı ayrı açılıp kapatılabilir.
- Her vakitte `1 saat önce`, `45 dakika önce`, `15 dakika önce` ve `vakit şimdi`
  seçenekleri bağımsızdır.
- Her vakit sesli veya sessiz olarak ayarlanabilir.
- Varsayılan ayarda dört zaman seçili, bildirim biçimi sessizdir.
- Konum veya Diyanet vakitleri değişince MIHRAB'ın eski planı silinir ve güncel saatlerle
  yeniden oluşturulur.

## Zamanlama

Diyanet'in haftalık tablosu kullanılır. İşletim sistemi kuyruk sınırları için kronolojik sıradaki
en fazla 60 yerel bildirim planlanır. Kuyruk uygulama her açıldığında ve vakit verisi her
yenilendiğinde güncellenir.

Android 12 ve üzerindeki kesin zamanlama için `SCHEDULE_EXACT_ALARM` izni uygulama yapılandırmasına
eklenmiştir. Android 8 ve üzerinde sesli ve sessiz bildirimler ayrı bildirim kanallarını kullanır.
iOS tarafında ses davranışı her bildirim içeriğinde belirlenir.

## Üretim notu

Yerel zamanlama sunucu gerektirmez ve çevrimdışı çalışır. Kullanıcı uygulamayı uzun süre hiç
açmazsa yerel kuyruk tükenebilir. İleride kesintisiz uzun dönem teslimat istenirse Diyanet
verisini kullanan MIHRAB sunucusu ve uzaktan bildirim altyapısı ayrıca kurulmalıdır.
