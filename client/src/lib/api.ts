import type { PuntoInteresse, ProfiloUtente } from "../../../shared/types";

const BASE = "/api";

export async function getPuntiInteresse(): Promise<PuntoInteresse[]> {
  const res = await fetch(`${BASE}/pois`);
  if (!res.ok) throw new Error("Impossibile caricare i punti di interesse");
  return res.json();
}

export async function getProfilo(): Promise<ProfiloUtente> {
  const res = await fetch(`${BASE}/rewards/profilo`);
  if (!res.ok) throw new Error("Impossibile caricare il profilo");
  return res.json();
}

export async function scansionaQR(qrToken: string): Promise<{ poi: PuntoInteresse; nuovoSconto: number }> {
  const res = await fetch(`${BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrToken })
  });
  if (!res.ok) throw new Error("QR non valido o già scansionato");
  return res.json();
}
