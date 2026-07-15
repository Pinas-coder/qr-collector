// Tipi condivisi tra client e server

export type CategoriaPOI = "Storia" | "Natura" | "Cultura" | "Bonus";

export interface PuntoInteresse {
  id: string;
  nome: string;
  categoria: CategoriaPOI;
  lat: number;
  lng: number;
  curiosita: string;
  fotoEsclusivaUrl: string;
  qrToken: string;
}

export interface QRScansionato {
  poiId: string;
  scansionatoIl: string; // ISO date
}

export interface ProfiloUtente {
  id: string;
  livelloEsploratore: number;
  qrRaccolti: QRScansionato[];
  streakGiorni: number;
}

export interface SogliaSconto {
  qrMinimi: number;
  percentuale: number;
}

export const SOGLIE_SCONTO: SogliaSconto[] = [
  { qrMinimi: 0, percentuale: 0 },
  { qrMinimi: 4, percentuale: 5 },
  { qrMinimi: 7, percentuale: 10 },
  { qrMinimi: 10, percentuale: 15 },
  { qrMinimi: 13, percentuale: 20 },
];

export function calcolaSconto(numeroQrRaccolti: number): number {
  let sconto = 0;
  for (const soglia of SOGLIE_SCONTO) {
    if (numeroQrRaccolti >= soglia.qrMinimi) {
      sconto = soglia.percentuale;
    }
  }
  return sconto;
}
export interface PuntoInteresse {
  id: string;
  nome: string;
  categoria: CategoriaPOI;
  lat: number;
  lng: number;
  curiosita: string;
  fotoEsclusivaUrl: string;
  qrToken: string;
  raggioMetri?: number; // default 100 se assente
}
