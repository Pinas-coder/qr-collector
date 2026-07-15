import express from "express";
import cors from "cors";
import "./db/store.js";
import { poisRouter } from "./modules/pois/pois.routes.js";
import { scanRouter } from "./modules/scan/scan.routes.js";
import { rewardsRouter } from "./modules/rewards/rewards.routes.js";
import { utenteAnonimo } from "./middleware/utente.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Da qui in poi ogni richiesta deve avere un X-User-Id valido
app.use("/api/pois", utenteAnonimo, poisRouter);
app.use("/api/scan", utenteAnonimo, scanRouter);
app.use("/api/rewards", utenteAnonimo, rewardsRouter);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server QR Collector in ascolto su http://localhost:${PORT}`);
});