import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../../data.json");

// server/src/db/store.ts
interface PoiRecord {
  id: string;
  nome: string;
  categoria: string;
  lat: number;
  lng: number;
  curiosita: string;
  fotoEsclusivaUrl: string;
  qrToken: string;
  raggioMetri?: number; // <-- aggiungi questa riga
}

interface ScanRecord {
  utenteId: string;
  poiId: string;
  scansionatoIl: string;
}

interface DataShape {
  puntiInteresse: PoiRecord[];
  scansioni: ScanRecord[];
}

function datiIniziali(): DataShape {
  return {
    puntiInteresse: [
      {
        id: "poi-1",
        nome: "Il pozzo sacro",
        categoria: "Storia",
        lat: 38.9989,
        lng: 16.5033,
        curiosita: "Costruito nell'età nuragica, veniva usato per riti legati al culto dell'acqua.",
        fotoEsclusivaUrl: "/foto/pozzo-sacro.jpg",
        qrToken: "TREK-QR-0001"
      },
      {
        id: "poi-2",
        nome: "La statua sussurrante",
        categoria: "Cultura",
        lat: 38.9995,
        lng: 16.504,
        curiosita: "La leggenda vuole che sussurrandole un desiderio all'orecchio si avveri entro un anno.",
        fotoEsclusivaUrl: "/foto/statua.jpg",
        qrToken: "TREK-QR-0002"
      }
    ],
    scansioni: []
  };
}

function leggi(): DataShape {
  if (!fs.existsSync(DATA_FILE)) {
    const dati = datiIniziali();
    scrivi(dati);
    return dati;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function scrivi(dati: DataShape) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dati, null, 2));
}

export function getPuntiInteresse(): Omit<PoiRecord, "qrToken">[] {
  return leggi().puntiInteresse.map(({ qrToken, ...resto }) => resto);
}

export function getPoiDaToken(qrToken: string): PoiRecord | undefined {
  return leggi().puntiInteresse.find((p) => p.qrToken === qrToken);
}

export function getScansioniUtente(utenteId: string): ScanRecord[] {
  return leggi().scansioni.filter((s) => s.utenteId === utenteId);
}

export function registraScansione(utenteId: string, poiId: string): void {
  const dati = leggi();
  const esiste = dati.scansioni.some((s) => s.utenteId === utenteId && s.poiId === poiId);
  if (!esiste) {
    dati.scansioni.push({ utenteId, poiId, scansionatoIl: new Date().toISOString() });
    scrivi(dati);
  }
}
