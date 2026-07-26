import { Router } from "express";
import { getPoiDaToken, getScansioniUtente, registraScansione } from "../../db/store.js";
import { distanzaMetri } from "../../utils/geo.js";
import { calcolaSconto } from "../../../../shared/types.js";

export const scanRouter = Router();

const RAGGIO_DEFAULT_METRI = 100;

scanRouter.post("/", (req, res) => {
  const { qrToken, lat, lng } = req.body as { qrToken?: string; lat?: number; lng?: number };

  if (!qrToken) {
    return res.status(400).json({ errore: "qrToken mancante" });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ errore: "Posizione mancante: lat/lng richiesti" });
  }

  const poi = getPoiDaToken(qrToken);
  if (!poi) {
    return res.status(404).json({ errore: "Codice QR non riconosciuto" });
  }

  const raggio = poi.raggioMetri ?? RAGGIO_DEFAULT_METRI;
  const distanza = distanzaMetri(lat, lng, poi.lat, poi.lng);

  if (distanza > raggio) {
    return res.status(403).json({
      errore: "Troppo lontano dal punto di interesse",
      distanzaMetri: Math.round(distanza),
      raggioConsentito: raggio
    });
  }

  const registrata = registraScansione(req.utenteId, poi.id);
  if (!registrata) {
    return res.status(409).json({ errore: "Questo QR è già stato scansionato" });
  }
  const totale = getScansioniUtente(req.utenteId).length;

  const { qrToken: _omesso, ...poiSenzaToken } = poi;
  res.json({ poi: poiSenzaToken, nuovoSconto: calcolaSconto(totale) });
});
