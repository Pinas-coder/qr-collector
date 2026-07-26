import { Router } from "express";
import { calcolaSconto } from "../../../../shared/types.js";
import { getPoiDaId, getScansioniUtente } from "../../db/store.js";

export const rewardsRouter = Router();

rewardsRouter.get("/profilo", (req, res) => {
  try {
    const scansioni = getScansioniUtente(req.utenteId).flatMap((scansione) => {
      const poi = getPoiDaId(scansione.poiId);
      if (!poi) {
        console.warn(`Scansione ignorata: POI non trovato (${scansione.poiId})`);
        return [];
      }

      const { qrToken: _token, ...poiPubblico } = poi;
      return [{ ...scansione, poi: poiPubblico }];
    });

    res.json({
      id: req.utenteId,
      livelloEsploratore: 1 + Math.floor(scansioni.length / 2),
      qrRaccolti: scansioni,
      streakGiorni: 0,
      scontoAttivo: calcolaSconto(scansioni.length)
    });
  } catch (error) {
    console.error("Impossibile costruire il profilo premi", error instanceof Error ? error.message : "errore sconosciuto");
    res.status(500).json({ errore: "Impossibile caricare il profilo premi" });
  }
});
