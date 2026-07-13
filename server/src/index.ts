import express from "express";
import cors from "cors";
import "./db/store.js"; // inizializza e semina i dati (store JSON, nessuna dipendenza nativa)
import { poisRouter } from "./modules/pois/pois.routes.js";
import { scanRouter } from "./modules/scan/scan.routes.js";
import { rewardsRouter } from "./modules/rewards/rewards.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/pois", poisRouter);
app.use("/api/scan", scanRouter);
app.use("/api/rewards", rewardsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server QR Collector in ascolto su http://localhost:${PORT}`);
});
