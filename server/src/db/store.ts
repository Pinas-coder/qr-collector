import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PuntoInteresse, PuntoInteresseConToken, QRScansionato } from "../../../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../../data.json");

interface ScanRecord extends QRScansionato { utenteId: string; }
interface DataShape { puntiInteresse: PuntoInteresseConToken[]; scansioni: ScanRecord[]; }

function datiIniziali(): DataShape {
  return { puntiInteresse: [
    { id: "poi-1", nome: "Il pozzo sacro", categoria: "Storia", lat: 38.9989, lng: 16.5033, curiosita: "Costruito nell'età nuragica, veniva usato per riti legati al culto dell'acqua.", fotoEsclusivaUrl: "/foto/pozzo-sacro.png", qrToken: "TREK-QR-0001" },
    { id: "poi-2", nome: "La statua sussurrante", categoria: "Cultura", lat: 38.9995, lng: 16.504, curiosita: "La leggenda vuole che sussurrandole un desiderio all'orecchio si avveri entro un anno.", fotoEsclusivaUrl: "/foto/statua-sussurrante.png", qrToken: "TREK-QR-0002" }
  ], scansioni: [] };
}

function leggi(): DataShape {
  if (!fs.existsSync(DATA_FILE)) { const dati = datiIniziali(); scrivi(dati); return dati; }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as DataShape;
}
function scrivi(dati: DataShape) { fs.writeFileSync(DATA_FILE, JSON.stringify(dati, null, 2)); }
function senzaToken({ qrToken: _token, ...poi }: PuntoInteresseConToken): PuntoInteresse { return poi; }

export function getPuntiInteresse(): PuntoInteresse[] { return leggi().puntiInteresse.map(senzaToken); }
export function getPoiDaId(poiId: string): PuntoInteresseConToken | undefined { return leggi().puntiInteresse.find((poi) => poi.id === poiId); }
export function getPoiDaToken(qrToken: string): PuntoInteresseConToken | undefined { return leggi().puntiInteresse.find((poi) => poi.qrToken === qrToken); }
export function getScansioniUtente(utenteId: string): QRScansionato[] { return leggi().scansioni.filter((scan) => scan.utenteId === utenteId).map(({ poiId, scansionatoIl }) => ({ poiId, scansionatoIl })); }

/** Restituisce la nuova scansione; `undefined` se quel POI è già stato raccolto. */
export function registraScansione(utenteId: string, poiId: string): QRScansionato | undefined {
  const dati = leggi();
  if (dati.scansioni.some((scan) => scan.utenteId === utenteId && scan.poiId === poiId)) return undefined;
  const scansione: ScanRecord = { utenteId, poiId, scansionatoIl: new Date().toISOString() };
  dati.scansioni.push(scansione);
  scrivi(dati);
  return { poiId: scansione.poiId, scansionatoIl: scansione.scansionatoIl };
}
