import { Router } from "express";
import { getPoiDaToken, getScansioniUtente, registraScansione } from "../../db/store.js";

export const scanRouter = Router();

// MVP: nessuna autenticazione ancora, un solo utente anonimo condiviso.
// Da sostituire con un vero utente_id quando aggiungiamo login.
const UTENTE_ANONIMO = "anon";

scanRouter.post("/", (req, res) => {
  const { qrToken } = req.body as { qrToken?: string };
  if (!qrToken) {
    return res.status(400).json({ errore: "qrToken mancante" });
  }

  const poi = getPoiDaToken(qrToken);
  if (!poi) {
    return res.status(404).json({ errore: "Codice QR non riconosciuto" });
  }

  registraScansione(UTENTE_ANONIMO, poi.id);
  const totale = getScansioniUtente(UTENTE_ANONIMO).length;

  const { qrToken: _omesso, ...poiSenzaToken } = poi;
  res.json({ poi: poiSenzaToken, nuovoSconto: calcolaSconto(totale) });
});

function calcolaSconto(numeroQrRaccolti: number): number {
  const soglie = [
    { qrMinimi: 0, percentuale: 0 },
    { qrMinimi: 4, percentuale: 5 },
    { qrMinimi: 7, percentuale: 10 },
    { qrMinimi: 10, percentuale: 15 },
    { qrMinimi: 13, percentuale: 20 }
  ];
  let sconto = 0;
  for (const s of soglie) if (numeroQrRaccolti >= s.qrMinimi) sconto = s.percentuale;
  return sconto;
}
