import { Router } from "express";
import { getScansioniUtente } from "../../db/store.js";

export const rewardsRouter = Router();

rewardsRouter.get("/profilo", (req, res) => {
  const scansioni = getScansioniUtente(req.utenteId).map((s) => ({
    poiId: s.poiId,
    scansionatoIl: s.scansionatoIl
  }));

  res.json({
    id: req.utenteId,
    livelloEsploratore: 1 + Math.floor(scansioni.length / 2),
    qrRaccolti: scansioni,
    streakGiorni: 0
  });
});