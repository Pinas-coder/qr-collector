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
- **Profilo, premi e dashboard**: Supabase Edge Function `get-rewards-profile`, con scansioni e POI sbloccati dell'utente autenticato.
- **Storage**: non è ancora configurato per le foto premio; la risposta della scansione espone quindi `fotoEsclusivaUrl: null` e mai il percorso privato.

Scanner, profilo, mappa e premi usano l'utente Supabase ricavato dal JWT. Express, `getUserId()` e `X-User-Id` restano nel repository esclusivamente per rollback e per le route legacy non ancora rimosse; non sono più usati dal frontend per premi o profilo.

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

Apri [http://localhost:5173](http://localhost:5173). Vite inoltra le eventuali richieste legacy `/api` al server sulla porta `4000`.

> Fotocamera e geolocalizzazione richiedono un contesto sicuro: `localhost` è supportato durante lo sviluppo; in produzione usa HTTPS e consenti i relativi permessi nel browser.

## Configurazione Supabase

Nel client crea `client/.env` a partire da `client/.env.example` e imposta:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Abilita **Anonymous Sign-Ins** nel progetto Supabase. L'utente anonimo viene creato o recuperato all'avvio dell'app; il trigger database crea il profilo con lo stesso UUID.

Le Edge Functions usano `@supabase/server`: nel runtime gestito dal Dashboard i client autenticato e amministrativo vengono predisposti dal contesto `withSupabase`, senza leggere o dichiarare chiavi nel codice. Non inserire mai chiavi secret o service-role nel client.

## Deploy e prova delle Edge Functions

Dalla Dashboard Supabase distribuisci **scan-poi** e **get-rewards-profile**. Con CLI remota, se disponibile:

```bash
supabase functions deploy scan-poi
supabase functions deploy get-rewards-profile
```

Per una prova manuale usa `TREK-QR-0001`, `TREK-QR-0002` o `TREK-QR-0003` e coordinate vicine al rispettivo POI. `scan-poi` registra la scansione in Supabase; `get-rewards-profile` restituisce poi solo le scansioni dell'utente JWT, i POI sbloccati e lo sconto. Nessuna delle due function restituisce `qr_token` né un percorso di Storage privato.

## API legacy temporanee

Gli endpoint Express seguenti restano nel repository esclusivamente per rollback e confronto:

| Metodo | Endpoint | Descrizione |
| --- | --- | --- |
| `GET` | `/api/health` | Controllo disponibilità server. |
| `GET` | `/api/pois` | Vecchie anteprime POI; la mappa usa ora la RPC Supabase. |
| `POST` | `/api/scan` | Vecchio flusso JSON, mantenuto per confronto e rollback. |
| `GET` | `/api/rewards/profilo` | Profilo legacy: non usato dal frontend. |

Il frontend usa `supabase.functions.invoke("scan-poi")` per la scansione e `supabase.functions.invoke("get-rewards-profile")` per profilo e premi, senza inviare `X-User-Id` alle Edge Functions.

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
