import type { AnteprimaPuntoInteresse, CategoriaPOI, PuntoInteresse, ProfiloUtente } from "../../../shared/types";
import { getSupabaseClient } from "./supabase";
import { getUserId } from "./userId";

const BASE = "/api";
export class ApiError extends Error { constructor(message: string, public readonly status: number) { super(message); this.name = "ApiError"; } }
function headers(extra?: Record<string, string>): HeadersInit { return { "X-User-Id": getUserId(), ...extra }; }
async function errorFrom(res: Response, fallback: string) { const body = await res.json().catch(() => null) as { errore?: string } | null; return new ApiError(body?.errore ?? fallback, res.status); }

const CATEGORIE_POI: readonly CategoriaPOI[] = ["Storia", "Natura", "Cultura", "Bonus"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCategoriaPOI(value: unknown): value is CategoriaPOI {
  return typeof value === "string" && CATEGORIE_POI.includes(value as CategoriaPOI);
}

function mappaPoiPubblico(value: unknown): AnteprimaPuntoInteresse {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    !isCategoriaPOI(value.category) ||
    typeof value.latitude !== "number" ||
    typeof value.longitude !== "number" ||
    (value.radius_meters !== null && typeof value.radius_meters !== "number")
  ) {
    throw new Error("La RPC get_public_points_of_interest ha restituito un POI non valido.");
  }

  return {
    id: value.id,
    nome: value.name,
    categoria: value.category,
    lat: value.latitude,
    lng: value.longitude,
    ...(typeof value.radius_meters === "number" ? { raggioMetri: value.radius_meters } : {})
  };
}

export async function getPuntiInteresse(): Promise<AnteprimaPuntoInteresse[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_public_points_of_interest");

  if (error) {
    throw new Error(`Impossibile caricare i punti di interesse da Supabase: ${error.message}`);
  }

  const rows: unknown = data;
  if (!Array.isArray(rows)) {
    throw new Error("La RPC get_public_points_of_interest non ha restituito una lista.");
  }

  return rows.map((row: unknown) => mappaPoiPubblico(row));
}
export async function getProfilo(): Promise<ProfiloUtente> { const res = await fetch(`${BASE}/rewards/profilo`, { headers: headers() }); if (!res.ok) throw await errorFrom(res, "Impossibile caricare il profilo"); return res.json(); }
export async function scansionaQR(qrToken: string, lat: number, lng: number): Promise<{ poi: PuntoInteresse; nuovoSconto: number }> { const res = await fetch(`${BASE}/scan`, { method: "POST", headers: headers({ "Content-Type": "application/json" }), body: JSON.stringify({ qrToken, lat, lng }) }); if (!res.ok) throw await errorFrom(res, "Impossibile elaborare il QR"); return res.json(); }
