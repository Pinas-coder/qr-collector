import { Router } from "express";
import { getScansioniUtente } from "../../db/store.js";

export const rewardsRouter = Router();

const UTENTE_ANONIMO = "anon";

rewardsRouter.get("/profilo", (_req, res) => {
  const scansioni = getScansioniUtente(UTENTE_ANONIMO).map((s) => ({
    poiId: s.poiId,
    scansionatoIl: s.scansionatoIl
  }));

  res.json({
    id: UTENTE_ANONIMO,
    livelloEsploratore: 1 + Math.floor(scansioni.length / 2),
    qrRaccolti: scansioni,
    streakGiorni: 0
  });
});
