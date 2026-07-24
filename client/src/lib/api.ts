import type { PuntoInteresse, ProfiloUtente } from "../../../shared/types";
import { getUserId } from "./userId";

const BASE = "/api";
export class ApiError extends Error { constructor(message: string, public readonly status: number) { super(message); this.name = "ApiError"; } }
function headers(extra?: Record<string, string>): HeadersInit { return { "X-User-Id": getUserId(), ...extra }; }
async function errorFrom(res: Response, fallback: string) { const body = await res.json().catch(() => null) as { errore?: string } | null; return new ApiError(body?.errore ?? fallback, res.status); }

export async function getPuntiInteresse(): Promise<PuntoInteresse[]> { const res = await fetch(`${BASE}/pois`, { headers: headers() }); if (!res.ok) throw await errorFrom(res, "Impossibile caricare i punti di interesse"); return res.json(); }
export async function getProfilo(): Promise<ProfiloUtente> { const res = await fetch(`${BASE}/rewards/profilo`, { headers: headers() }); if (!res.ok) throw await errorFrom(res, "Impossibile caricare il profilo"); return res.json(); }
export async function scansionaQR(qrToken: string, lat: number, lng: number): Promise<{ poi: PuntoInteresse; nuovoSconto: number }> { const res = await fetch(`${BASE}/scan`, { method: "POST", headers: headers({ "Content-Type": "application/json" }), body: JSON.stringify({ qrToken, lat, lng }) }); if (!res.ok) throw await errorFrom(res, "Impossibile elaborare il QR"); return res.json(); }
