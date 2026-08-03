# QR Collector

Web app mobile-first per scoprire punti di interesse tramite QR code fisici. Ogni scansione valida sblocca curiosità e contribuisce a uno sconto cumulativo.

## Funzionalità

- Mappa Leaflet con marker per categoria, legenda e stato dei POI sbloccati.
- Scansione QR dalla fotocamera (`html5-qrcode`) e inserimento manuale del token.
- Verifica della posizione al momento della scansione tramite formula di Haversine.
- Sessione Supabase anonima persistente nel browser.
- Dashboard, premi e galleria delle curiosità/foto sbloccate.
- Animazioni e transizioni UI con Framer Motion e PWA Vite.

## Architettura e stato della migrazione

- **Frontend React/Vite PWA**: Supabase Auth con sessione anonima; POI pubblici tramite RPC `get_public_points_of_interest`.
- **Scansione QR**: Supabase Edge Function `scan-poi`, invocata dal client con il JWT della sessione anonima.
- **Database Supabase**: PostgreSQL conserva profili, POI e le nuove scansioni; il vincolo `(user_id, poi_id)` impedisce duplicati.
- **Premi e dashboard**: continuano temporaneamente a usare Express e `server/data.json` con l'UUID legacy in `X-User-Id`.
- **Storage**: non è ancora configurato per le foto premio; la risposta della scansione espone quindi `fotoEsclusivaUrl: null` e mai il percorso privato.

La doppia identità è intenzionale e limitata alla migrazione dei premi: lo scanner usa l'utente Supabase ricavato dal JWT, mentre il profilo premi legacy resta su Express. Non eliminare ancora `getUserId()`, `X-User-Id` o il server JSON.

## Avvio locale

Sono richiesti Node.js e npm. Per il backend legacy:

```bash
cd server
npm install
npm run dev
```

In un secondo terminale avvia il frontend:

```bash
cd client
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173). Vite inoltra le richieste `/api` al server sulla porta `4000` per profilo e premi legacy.

> Fotocamera e geolocalizzazione richiedono un contesto sicuro: `localhost` è supportato durante lo sviluppo; in produzione usa HTTPS e consenti i relativi permessi nel browser.

## Configurazione Supabase

Nel client crea `client/.env` a partire da `client/.env.example` e imposta:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Abilita **Anonymous Sign-Ins** nel progetto Supabase. L'utente anonimo viene creato o recuperato all'avvio dell'app; il trigger database crea il profilo con lo stesso UUID.

Per la Edge Function configura in Supabase i secret indicati in `supabase/.env.example`:

- `SUPABASE_URL`;
- una chiave pubblica: `SUPABASE_PUBLISHABLE_KEY` oppure il legacy `SUPABASE_ANON_KEY`;
- una chiave privilegiata solo server-side: `SUPABASE_SECRET_KEY` oppure `SUPABASE_SERVICE_ROLE_KEY`;
- `ALLOWED_ORIGINS`, includendo `http://localhost:5173` e il dominio Netlify in produzione.

Non inserire mai chiavi secret o service-role nel client.

## Deploy e prova di `scan-poi`

Dalla Dashboard Supabase: **Edge Functions → scan-poi → Deploy**. Con CLI remota, se disponibile:

```bash
supabase functions deploy scan-poi
```

Per una prova manuale usa `TREK-QR-0001`, `TREK-QR-0002` o `TREK-QR-0003` e coordinate vicine al rispettivo POI. La funzione richiede la sessione anonima del browser, registra la scansione in Supabase e non restituisce `qr_token` né un percorso di Storage privato.

## API legacy temporanee

Gli endpoint Express seguenti restano attivi solo per compatibilità con premi e dashboard:

| Metodo | Endpoint | Descrizione |
| --- | --- | --- |
| `GET` | `/api/health` | Controllo disponibilità server. |
| `GET` | `/api/pois` | Vecchie anteprime POI; la mappa usa ora la RPC Supabase. |
| `POST` | `/api/scan` | Vecchio flusso JSON, mantenuto per confronto e rollback. |
| `GET` | `/api/rewards/profilo` | Profilo e premi legacy. |

La pagina scanner usa invece `supabase.functions.invoke("scan-poi")` e non invia `X-User-Id` alla funzione.

## Dati di esempio

I token demo sono:

- `TREK-QR-0001`
- `TREK-QR-0002`
- `TREK-QR-0003`

I POI Supabase sono definiti in `supabase/seed.sql`; i dati legacy restano in `server/data.json`.

## Build

```bash
cd client
npm ci
npm run build

cd ../server
npm ci
npm run build
```

Per la foundation locale Supabase, dopo aver installato Supabase CLI e Docker:

```bash
supabase start
supabase db reset
supabase db lint
```
