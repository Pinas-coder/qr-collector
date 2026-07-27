insert into public.points_of_interest (
  slug, name, category, latitude, longitude, radius_meters, curiosity,
  preview_photo_path, exclusive_photo_path, qr_token, is_active
) values
  ('pozzo-sacro-santa-cristina', 'Pozzo sacro di Santa Cristina', 'Storia', 40.0613692, 8.7321004, 100,
   'Il pozzo sacro nuragico è celebre per la scala di venticinque gradini che conduce alla camera con acqua sorgiva.',
   'poi-previews/pozzo-sacro.png', 'poi-rewards/pozzo-sacro.png', 'TREK-QR-0001', true),
  ('santuario-campestre-santa-cristina', 'Santuario campestre di Santa Cristina', 'Cultura', 40.0609505, 8.7313519, 100,
   'La piccola chiesa campestre è il cuore delle celebrazioni tradizionali che animano il sito di Santa Cristina.',
   'poi-previews/santa-cristina.png', 'poi-rewards/santa-cristina.png', 'TREK-QR-0002', true),
  ('villaggio-nuragico-santa-cristina', 'Villaggio nuragico di Santa Cristina', 'Cultura', 40.060928, 8.7293256, 100,
   'Tra capanne circolari e muri a secco si riconosce l''organizzazione quotidiana di un antico insediamento nuragico.',
   'poi-previews/villaggio-nuragico.png', 'poi-rewards/villaggio-nuragico.png', 'TREK-QR-0003', true)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  radius_meters = excluded.radius_meters,
  curiosity = excluded.curiosity,
  preview_photo_path = excluded.preview_photo_path,
  exclusive_photo_path = excluded.exclusive_photo_path,
  qr_token = excluded.qr_token,
  is_active = excluded.is_active;
