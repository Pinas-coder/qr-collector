import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AnteprimaPuntoInteresse, PuntoInteresseConToken, QRScansionato } from "../../../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../../data.json");

interface ScanRecord extends QRScansionato { utenteId: string; }
interface DataShape { puntiInteresse: PuntoInteresseConToken[]; scansioni: ScanRecord[]; }

function datiIniziali(): DataShape {
  return { puntiInteresse: [
    { id: "poi-1", nome: "Pozzo sacro di Santa Cristina", categoria: "Storia", lat: 40.0613692, lng: 8.7321004, curiosita: "Il pozzo sacro nuragico è celebre per la scala di venticinque gradini che conduce alla camera con acqua sorgiva.", fotoEsclusivaUrl: "/foto/pozzo-sacro.png", qrToken: "TREK-QR-0001", raggioMetri: 100 },
    { id: "poi-2", nome: "Santuario campestre di Santa Cristina", categoria: "Cultura", lat: 40.0609505, lng: 8.7313519, curiosita: "La piccola chiesa campestre è il cuore delle celebrazioni tradizionali che animano il sito di Santa Cristina.", fotoEsclusivaUrl: "/foto/santa-cristina.png", qrToken: "TREK-QR-0002", raggioMetri: 100 },
    { id: "poi-3", nome: "Villaggio nuragico di Santa Cristina", categoria: "Cultura", lat: 40.060928, lng: 8.7293256, curiosita: "Tra capanne circolari e muri a secco si riconosce l'organizzazione quotidiana di un antico insediamento nuragico.", fotoEsclusivaUrl: "/foto/villaggio-nuragico.png", qrToken: "TREK-QR-0003", raggioMetri: 100 }
  ], scansioni: [] };
}

function leggi(): DataShape {
  if (!fs.existsSync(DATA_FILE)) { const dati = datiIniziali(); scrivi(dati); return dati; }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as DataShape;
}
function scrivi(dati: DataShape) { fs.writeFileSync(DATA_FILE, JSON.stringify(dati, null, 2)); }
function anteprima({ id, nome, categoria, lat, lng, raggioMetri }: PuntoInteresseConToken): AnteprimaPuntoInteresse { return { id, nome, categoria, lat, lng, raggioMetri }; }

export function getPuntiInteresse(): AnteprimaPuntoInteresse[] { return leggi().puntiInteresse.map(anteprima); }
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
