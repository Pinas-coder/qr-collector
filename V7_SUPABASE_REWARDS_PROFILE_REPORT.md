# Report V7 — Supabase Rewards Profile

## Obiettivo completato

Il frontend usa ora Supabase per autenticazione anonima, POI pubblici, scansioni e profilo premi. Il server Express e lo store JSON restano nel repository come fallback e materiale di rollback, ma il frontend non usa più `GET /api/rewards/profilo`.

## Flusso corrente

```text
Browser anonimo
  -> Supabase Auth
  -> scan-poi (Edge Function)
  -> public.scans
  -> get-rewards-profile (Edge Function)
  -> Mappa, Dashboard, I tuoi premi
```

| Area | Implementazione attuale |
| --- | --- |
| Autenticazione | Sessione anonima Supabase |
| POI mappa | RPC `get_public_points_of_interest` |
| Scansione | Edge Function `scan-poi` |
| Profilo e premi | Edge Function `get-rewards-profile` |
| Immagini premio | Non ancora implementate: `fotoEsclusivaUrl` è `null` |
| Express / JSON | Preservati per rollback; non usati dal frontend per il profilo |

## Edge Function `get-rewards-profile`

- Richiede una sessione valida con `withSupabase({ auth: "user" })`.
- Deriva l'utente esclusivamente da `context.userClaims.sub`.
- Accetta soltanto `POST` con body `{}`.
- Legge `profiles`, creando il record solo come fallback per lo stesso UUID autenticato.
- Legge `scans` filtrando esplicitamente `user_id` e ordinando `scanned_at desc`.
- Recupera i POI tramite `context.supabaseAdmin`, senza leggere `qr_token`.
- Esclude scansioni orfane o record non validi, con warning senza dati sensibili.
- Restituisce POI sbloccati completi, senza `qr_token` né `exclusive_photo_path`.

Risposta di successo:

```json
{
  "id": "uuid-utente",
  "livelloEsploratore": 1,
  "qrRaccolti": [],
  "streakGiorni": 0,
  "scontoAttivo": 0,
  "totaleScansioni": 0
}
```

Il livello è calcolato da `1 + Math.floor(totaleScansioni / 2)`. Il campo `profiles.explorer_level` non viene aggiornato in questa fase.

## Sconto condiviso

`supabase/functions/_shared/rewards.ts` è importato sia da `scan-poi` sia da `get-rewards-profile`.

- 0 scansioni: 0%
- 4 scansioni: 5%
- 7 scansioni: 10%
- 10 scansioni: 15%
- 13 scansioni: 20%

## Frontend

`getProfilo()` invoca `supabase.functions.invoke("get-rewards-profile")` con il JWT della sessione e valida a runtime la struttura della risposta.

- Mappa: usa `profilo.qrRaccolti` per i marker sbloccati e `totaleScansioni` nel contatore.
- Premi: usa direttamente `scansione.poi`; la lista RPC dei POI serve soltanto per gli elementi bloccati.
- Dashboard: mostra livello, sconto e totale restituiti dal profilo Supabase.

## JWT e configurazione

Entrambe le Edge Functions usano `withSupabase({ auth: "user" })`. In `supabase/config.toml` entrambe hanno `verify_jwt = false`, perché il wrapper esegue l'autorizzazione e fornisce i client di contesto.

## Verifiche eseguite

- Sintassi Edge Functions controllata con esbuild.
- `client`: `npm ci` e `npm run build` completati.
- `server`: `npm ci` e `npm run build` completati.
- `git diff --check` completato senza errori.

## Limiti e test da fare sul progetto Supabase

In questa macchina non sono installati Deno e Supabase CLI; non è stato possibile distribuire o interrogare il progetto remoto.

Dopo il deploy eseguire questi test:

1. Utente anonimo senza scansioni: array vuoto, totale 0 e sconto 0.
2. Prima scansione valida: riga in `public.scans` con `user_id` del JWT.
3. Refresh di mappa e premi: POI ancora sbloccato.
4. Seconda scansione dello stesso POI: `409` da `scan-poi`.
5. Secondo utente anonimo: nessuna visibilità sulle scansioni del primo.
6. Verifica risposta: assenza di `qr_token`, `exclusive_photo_path`, JWT e chiavi segrete.

## Deploy Dashboard

1. Aprire **Supabase Dashboard → Edge Functions**.
2. Creare o aggiornare `scan-poi` e `get-rewards-profile` con i rispettivi `index.ts`.
3. Distribuire entrambe le funzioni.
4. Assicurarsi che Anonymous Sign-Ins sia abilitato.
5. Aprire l'app, eseguire una scansione demo e aggiornare mappa o pagina premi.

Endpoint profilo: `/functions/v1/get-rewards-profile`.
