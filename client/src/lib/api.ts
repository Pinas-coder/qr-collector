import type { PuntoInteresse, ProfiloUtente } from "../../../shared/types";
import { getUserId } from "./userId";

const BASE = "/api";

function headers(extra?: Record<string, string>): HeadersInit {
  return {
    "X-User-Id": getUserId(),
    ...extra
  };
}

export async function getPuntiInteresse(): Promise<PuntoInteresse[]> {
  const res = await fetch(`${BASE}/pois`, { headers: headers() });
  if (!res.ok) throw new Error("Impossibile caricare i punti di interesse");
  return res.json();
}

export async function getProfilo(): Promise<ProfiloUtente> {
  const res = await fetch(`${BASE}/rewards/profilo`, { headers: headers() });
  if (!res.ok) throw new Error("Impossibile caricare il profilo");
  return res.json();
}

export async function scansionaQR(
  qrToken: string,
  lat: number,
  lng: number
): Promise<{ poi: PuntoInteresse; nuovoSconto: number }> {
  const res = await fetch(`${BASE}/scan`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ qrToken, lat, lng })
  });
  if (!res.ok) throw new Error("QR non valido, troppo lontano, o già scansionato");
  return res.json();
}
