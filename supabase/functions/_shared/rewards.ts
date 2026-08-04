export const SOGLIE_SCONTO = [
  { qrMinimi: 0, percentuale: 0 },
  { qrMinimi: 4, percentuale: 5 },
  { qrMinimi: 7, percentuale: 10 },
  { qrMinimi: 10, percentuale: 15 },
  { qrMinimi: 13, percentuale: 20 }
] as const;

export function calcolaSconto(numeroScansioni: number): number {
  let risultato = 0;

  for (const soglia of SOGLIE_SCONTO) {
    if (numeroScansioni >= soglia.qrMinimi) {
      risultato = soglia.percentuale;
    }
  }

  return risultato;
}
