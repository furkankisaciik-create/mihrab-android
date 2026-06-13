# Kıble Pusulası

## Hesaplama

- Kâbe koordinatı: `21.422487, 39.826206`
- Kullanıcının güncel koordinatı cihazın yüksek doğruluklu konum servisiyle alınır.
- Kıble azimutu, iki koordinat arasındaki büyük çemberin başlangıç yönüyle hesaplanır.
- Kâbe mesafesi Haversine yöntemiyle bilgi amaçlı gösterilir.
- Bütün hesaplamalar cihaz içinde yapılır; kıble için harici bir API kullanılmaz.

## Pusula yönü

`expo-location` canlı cihaz yönünü verir. Uygulama `trueHeading` mevcutsa gerçek kuzeyi,
değilse `magHeading` ile manyetik kuzeyi kullanır. Android tarafında Expo Location, cihazın
konumu ve `GeomagneticField` ile manyetik sapmayı düzelterek gerçek kuzeyi üretir.

Başlık değişimleri dairesel düşük geçiren filtreyle yumuşatılır. Bu sayede `359°` ile `0°`
arasındaki geçişte pusula ters yönde sıçramaz.

## Doğruluk

- Yüksek veya orta sensör doğruluğunda ve yön farkı `3°` veya daha azsa kullanıcıya
  "Kıble hizasındasınız" bilgisi gösterilir.
- Düşük doğrulukta hizalanma iddiasında bulunulmaz.
- Kullanıcıya telefonu yatay tutma, metal ve elektronik eşyalardan uzaklaşma ve havada sekiz
  çizerek kalibrasyon yapma yönlendirmesi gösterilir.
- Web önizlemesinde koordinata göre kıble azimutu gösterilir ancak canlı pusula yalnız Android
  ve iOS cihazda çalışır.
