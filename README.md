# QR Collector

Web app mobile-first per collezionare QR code fisici in punti di interesse, sbloccando curiosità, sconti cumulabili e foto esclusive.

## Struttura

```
/client        React + Vite + TypeScript + Tailwind + Framer Motion + react-leaflet + PWA
/server        Express + TypeScript + store JSON su file (nessuna dipendenza nativa), organizzato a moduli (pois, scan, rewards)
/shared        Tipi TypeScript condivisi tra client e server
docker-compose.yml
```

## Avvio in locale

**Server** (porta 4000):
```bash
cd server
npm install
npm run dev
```

**Client** (porta 5173, con proxy verso /api):
```bash
cd client
npm install
npm run dev
```

Apri `http://localhost:5173`.

## Stato attuale

- 4 schermate collegate da router: Dashboard, Mappa scoperte, Scansiona QR, I tuoi premi
- Stile Tailwind con i design token del mockup Stitch (`Discovery Quest`) già trasferiti in `tailwind.config.ts`
- Backend minimo con 3 endpoint: `GET /api/pois`, `POST /api/scan`, `GET /api/rewards/profilo`
- Un solo "utente anonimo" condiviso — nessun login ancora
- Mappa con Leaflet + 2 punti di interesse di esempio, seedati automaticamente in `server/data.json` al primo avvio
- Dati persistiti in un semplice file JSON (`server/data.json`), niente database vero e nessuna dipendenza nativa da compilare — comodo per iniziare, da sostituire con Postgres/SQLite quando il progetto cresce

## Da fare

- [ ] Vero scanner QR via fotocamera (es. libreria `qr-scanner`), oggi c'è solo l'inserimento manuale del codice
- [ ] Generazione reale del QR sconto in "I tuoi premi" (es. `qrcode.react`)
- [ ] Autenticazione utente (anche solo un ID anonimo persistente in localStorage, per iniziare)
- [ ] Verifica di geolocalizzazione alla scansione, per evitare scansioni da remoto
- [ ] Animazioni Framer Motion su sblocco frammenti e progress bar
- [ ] Icone PWA reali in `client/public` (192x192, 512x512)
