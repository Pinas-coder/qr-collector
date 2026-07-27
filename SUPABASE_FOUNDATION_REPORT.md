# Report di analisi — QR Collector / Supabase Foundation

**Branch:** `V5SupabaseFoundation`  
**Data:** 27 luglio 2026  
**Scopo:** analisi tecnica della foundation Supabase, senza collegare ancora il frontend React né rimuovere Express/store JSON.

## 1. Stato iniziale rilevato

Prima di questa fase il repository conteneva una sola migration relativa a RLS, view e RPC dei POI pubblici. Mancavano:

- configurazione Supabase CLI;
- migration dello schema base;
- seed SQL;
- Edge Functions;
- file `.env.example`;
- documentazione della strategia V5.

Il frontend e il backend Express restano operativi e non sono stati migrati a Supabase.

## 2. Struttura Supabase introdotta

```text
supabase/
├── config.toml
├── .env.example
├── seed.sql
├── migrations/
│   ├── 20260726000000_init_qr_collector_schema.sql
│   └── 20260727000000_public_poi_access_and_rls.sql
└── functions/
    ├── scan-poi/index.ts
    └── get-rewards-profile/index.ts
```

Ordine delle migration:

1. `20260726000000_init_qr_collector_schema.sql`: crea tabelle, indici e trigger.
2. `20260727000000_public_poi_access_and_rls.sql`: configura RLS, privilegi, view e RPC.

## 3. Schema database

### `public.profiles`

- Chiave primaria `id`, con foreign key verso `auth.users(id)` e `on delete cascade`.
- Campi applicativi: `explorer_level`, `streak_days`, `created_at`, `updated_at`.
- Constraint: livello >= 1, streak >= 0.

### `public.points_of_interest`

- Identificatore UUID e `slug` univoco.
- Metadati geografici: categoria, coordinate, raggio.
- Contenuti sensibili: `qr_token`, `curiosity`, `exclusive_photo_path`.
- Campo `preview_photo_path` per l’anteprima futura.
- Flag `is_active`.
- Constraint su categoria, coordinate e raggio.

### `public.scans`

- Collega utente e POI.
- Memorizza coordinate, distanza e timestamp di scansione.
- Constraint obbligatorio `unique (user_id, poi_id)` per impedire duplicati.
- Constraint su coordinate e distanza.

### Indici

- `scans_user_id_idx`
- `scans_poi_id_idx`
- `scans_scanned_at_idx`
- `points_of_interest_active_idx`

## 4. Trigger

- `public.set_updated_at()` aggiorna `updated_at` prima di ogni update su profili e POI.
- `public.handle_new_user()` crea automaticamente un record `profiles` dopo la creazione di un utente in `auth.users`.

## 5. Sicurezza e Row Level Security

RLS è abilitata su:

- `public.profiles`
- `public.points_of_interest`
- `public.scans`

Politiche presenti:

- Un utente autenticato può leggere soltanto il proprio profilo: `auth.uid() = id`.
- Un utente autenticato può leggere soltanto le proprie scansioni: `auth.uid() = user_id`.

Non sono presenti policy client-side per inserire, aggiornare o cancellare scansioni. Non è presente una policy di lettura diretta dei POI completi.

I privilegi diretti sulle tabelle vengono revocati a `anon` e `authenticated`; vengono concessi solo `SELECT` su profili/scansioni per permettere alle policy RLS di filtrare le righe.

## 6. Accesso pubblico ai POI

È definita la view `public.public_points_of_interest` con `security_invoker = true` e sole colonne:

- `id`
- `slug`
- `name`
- `category`
- `latitude`
- `longitude`
- `radius_meters`
- `preview_photo_path`

La view non riceve grant client. Con `security_invoker`, concederle accesso richiederebbe anche privilegi sulla tabella sottostante, che contiene token e contenuti bloccati.

L’interfaccia pubblica principale è invece la RPC `public.get_public_points_of_interest()`:

- `SECURITY DEFINER`;
- `search_path` esplicito;
- nessun input;
- filtra solo `is_active = true`;
- restituisce esclusivamente le colonne pubbliche;
- eseguibile solo da `authenticated`;
- non accessibile a `anon` senza sessione.

## 7. Seed

`supabase/seed.sql` è idempotente tramite `on conflict (slug) do update`.

Inserisce solo tre POI sardi:

1. Pozzo sacro di Santa Cristina — `TREK-QR-0001`
2. Santuario campestre di Santa Cristina — `TREK-QR-0002`
3. Villaggio nuragico di Santa Cristina — `TREK-QR-0003`

Non inserisce scansioni demo.

I percorsi Storage presenti nel seed sono intenzionalmente solo riferimenti futuri; la migrazione fisica delle immagini non fa parte di questa fase.

## 8. Edge Functions

Sono presenti due skeleton TypeScript:

- `scan-poi`: solo `POST`, CORS e `OPTIONS`, controllo header Authorization, risposta `501`.
- `get-rewards-profile`: solo `POST`, CORS e `OPTIONS`, controllo header Authorization, risposta `501`.

Entrambe hanno `verify_jwt = true` in `supabase/config.toml` e non accettano un’identità utente dal body.

La logica definitiva di Haversine, lookup token, inserimento scansione, profilo premi e URL firmati è documentata come TODO e non ancora implementata.

## 9. Configurazione e segreti

Sono presenti:

- `client/.env.example`: URL e publishable key pubblica.
- `supabase/.env.example`: URL, publishable key e secret key senza valori reali.

Nessun secret reale è stato aggiunto. Il `.gitignore` già ignora `.env` e `.env.*`, preservando `.env.example`.

## 10. Verifiche eseguite

Comandi riusciti:

```text
server: npm ci
server: npm run build
client: npm ci
client: npm run build
git diff --check
```

Il client genera un avviso non bloccante: bundle iniziale superiore a 500 kB.

## 11. Verifiche non eseguite e motivazione

La CLI `supabase` non è installata nell’ambiente. Non è stato quindi possibile eseguire:

```bash
supabase start
supabase db reset
supabase db lint
```

Di conseguenza non sono stati testati contro un database PostgreSQL reale:

- applicazione effettiva delle migration;
- trigger `auth.users -> profiles`;
- idempotenza del seed;
- policy RLS tra due utenti distinti;
- privilegi reali della view/RPC;
- esecuzione locale delle Edge Functions.

## 12. Elementi deliberatamente non toccati

- Client React e relativo flusso API.
- Express, `server/data.json`, header `X-User-Id` e rotte esistenti.
- Scanner QR e geolocalizzazione correnti.
- Supabase Auth nel client.
- Storage effettivo delle immagini.
- Logica completa delle Edge Functions.
- Collegamento a un progetto Supabase remoto.

## 13. Rischi e punti da validare

1. La migration deve essere eseguita con Supabase CLI/Docker per confermare compatibilità con la versione PostgreSQL locale.
2. Va verificato che il ruolo proprietario della funzione RPC possa leggere `points_of_interest` con RLS attiva; la funzione `SECURITY DEFINER` è progettata per questo scenario, ma richiede un test reale.
3. Va verificato il comportamento JWT sul preflight `OPTIONS` nel runtime locale/deploy.
4. I percorsi Storage del seed sono contratti futuri: i bucket e gli oggetti non esistono ancora.

## 14. Passo consigliato successivo

Installare Supabase CLI e Docker, poi eseguire dalla root:

```bash
supabase start
supabase db reset
supabase db lint
```

Dopo una validazione positiva, il passo successivo è collegare il frontend a Supabase Auth anonimo e alla RPC dei POI pubblici, mantenendo Express come fallback temporaneo fino al completamento delle Edge Functions.
