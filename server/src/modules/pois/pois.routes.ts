import { Router } from "express";
import { getPuntiInteresse } from "../../db/store.js";

export const poisRouter = Router();

poisRouter.get("/", (_req, res) => {
  // Nota: il qr_token NON viene esposto qui di proposito — altrimenti basterebbe
  // chiamare questa API per "collezionare" un QR senza essere fisicamente sul posto.
  res.json(getPuntiInteresse());
});
