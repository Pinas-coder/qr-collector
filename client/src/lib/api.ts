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

export interface ScanPoiSuccessResponse {
  message: string;
  scan: {
    poiId: string;
    scannedAt: string;
    distanceMeters: number;
  };
  poi: PuntoInteresse;
  totalScans: number;
  activeDiscount: number;
}

export class ScanPoiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string) {
    super(message);
    this.name = "ScanPoiError";
  }
}

function isPuntoInteresse(value: unknown): value is PuntoInteresse {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.nome === "string" &&
    isCategoriaPOI(value.categoria) &&
    typeof value.lat === "number" && Number.isFinite(value.lat) &&
    typeof value.lng === "number" && Number.isFinite(value.lng) &&
    typeof value.curiosita === "string" &&
    (typeof value.fotoEsclusivaUrl === "string" || value.fotoEsclusivaUrl === null) &&
    (value.raggioMetri === undefined || (typeof value.raggioMetri === "number" && Number.isFinite(value.raggioMetri)));
}

function isScanPoiSuccessResponse(value: unknown): value is ScanPoiSuccessResponse {
  if (!isRecord(value) || typeof value.message !== "string" || !isRecord(value.scan)) return false;

  return typeof value.scan.poiId === "string" &&
    typeof value.scan.scannedAt === "string" &&
    typeof value.scan.distanceMeters === "number" && Number.isFinite(value.scan.distanceMeters) &&
    isPuntoInteresse(value.poi) &&
    typeof value.totalScans === "number" && Number.isInteger(value.totalScans) && value.totalScans >= 0 &&
    typeof value.activeDiscount === "number" && Number.isFinite(value.activeDiscount);
}

async function scanPoiErrorFrom(error: unknown): Promise<ScanPoiError> {
  if (isRecord(error) && error.context instanceof Response) {
    const response = error.context;
    const payload: unknown = await response.clone().json().catch(() => null);
    if (isRecord(payload) && typeof payload.error === "string") {
      return new ScanPoiError(payload.error, response.status, typeof payload.code === "string" ? payload.code : undefined);
    }
    return new ScanPoiError("Errore durante la scansione", response.status);
  }

  return new ScanPoiError("Servizio di scansione temporaneamente non disponibile", 0);
}

export async function scansionaQR(qrToken: string, lat: number, lng: number): Promise<ScanPoiSuccessResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<unknown>("scan-poi", {
    body: { qrToken, lat, lng }
  });

  if (error) throw await scanPoiErrorFrom(error);
  if (!isScanPoiSuccessResponse(data)) {
    throw new ScanPoiError("Risposta non valida dal servizio di scansione", 0, "invalid_response");
  }

  return data;
}
export async function getProfilo(): Promise<ProfiloUtente> { const res = await fetch(`${BASE}/rewards/profilo`, { headers: headers() }); if (!res.ok) throw await errorFrom(res, "Impossibile caricare il profilo"); return res.json(); }
