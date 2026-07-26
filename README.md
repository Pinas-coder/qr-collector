# QR Collector

Web app mobile-first per scoprire punti di interesse tramite QR code fisici. Ogni scansione valida sblocca curiosità, foto esclusive e contribuisce a uno sconto cumulativo.

## Funzionalità

- Mappa Leaflet con tile CartoDB, marker per categoria, legenda e stato dei POI sbloccati.
- Scansione QR dalla fotocamera (`html5-qrcode`) e inserimento manuale del token.
- Verifica della posizione al momento della scansione: il QR è valido solo entro il raggio del POI.
- Profilo anonimo persistente nel browser tramite UUID in `localStorage`.
- Dashboard, premi e galleria delle curiosità/foto sbloccate.
- Animazioni e transizioni UI con Framer Motion, inclusa una sequenza celebrativa allo sblocco.
- PWA con manifest e icona applicativa.
- Persistenza leggera in `server/data.json`.

## Architettura

```
client/   React + Vite + TypeScript + Tailwind + Framer Motion + React Leaflet + PWA
server/   Express + TypeScript, moduli pois / scan / rewards, store JSON locale
shared/   Tipi TypeScript condivisi
```

## Avvio locale

Sono richiesti Node.js e npm.

Avvia prima il backend:

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

Apri [http://localhost:5173](http://localhost:5173). Vite inoltra le richieste `/api` al server sulla porta `4000`.

> La fotocamera e la geolocalizzazione richiedono un contesto sicuro: `localhost` è supportato durante lo sviluppo; in produzione usa HTTPS e consenti i relativi permessi nel browser.

## API

Tutti gli endpoint applicativi richiedono l'header `X-User-Id`, un UUID v4 generato e salvato dal client.

| Metodo | Endpoint | Descrizione |
| --- | --- | --- |
| `GET` | `/api/health` | Controllo disponibilità server. |
| `GET` | `/api/pois` | Anteprime dei POI per la mappa: non espone token, curiosità o foto esclusive. |
| `POST` | `/api/scan` | Registra una scansione valida. Body: `{ qrToken, lat, lng }`. |
| `GET` | `/api/rewards/profilo` | Profilo e scansioni arricchite con i dati pubblici del POI sbloccato. |

Una scansione duplicata restituisce `409`; una posizione fuori raggio restituisce `403`.

## Dati di esempio

I POI e le scansioni sono salvati in [server/data.json](server/data.json). I token demo sono:

- `TREK-QR-0001`
- `TREK-QR-0002`
- `TREK-QR-0003`

Per una prova completa, usa una posizione vicina alle coordinate del POI oppure modifica i dati demo in ambiente locale.

## Build di produzione

```bash
cd server
npm run build

cd ../client
npm run build
```

Il client genera la cartella `client/dist`. Il server genera il JavaScript compilato in `server/dist`.

## Limiti e prossimi passi

- L'UUID anonimo non sostituisce un'autenticazione reale.
- Coordinate e token QR possono essere falsificati da un client modificato: per premi reali servono QR firmati/monouso e controlli antifrode lato server.
- Lo store JSON è adeguato a demo e piccoli test; per produzione è consigliato un database.
- Il QR dello sconto nella pagina Premi è ancora un placeholder visivo.
- Docker Compose è stato rimosso finché non sarà disponibile una configurazione coerente con lo store JSON.
