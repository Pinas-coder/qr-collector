import { withSupabase } from "npm:@supabase/server@^1";
import { calcolaSconto } from "../_shared/rewards.ts";

type CategoriaPOI = "Storia" | "Natura" | "Cultura" | "Bonus";

interface ScanPoiRequest {
  qrToken: string;
  lat: number;
  lng: number;
}

interface PoiRecord {
  id: string;
  name: string;
  category: CategoriaPOI;
  latitude: number;
  longitude: number;
  radius_meters: number;
  curiosity: string;
  exclusive_photo_path: string | null;
}

interface ScanRecord {
  poi_id: string;
  scanned_at: string;
  distance_meters: number;
}

const EARTH_RADIUS_METERS = 6_371_000;
const CATEGORIE_POI: readonly CategoriaPOI[] = ["Storia", "Natura", "Cultura", "Bonus"];

function jsonResponse(body: Record<string, unknown>, status: number, extraHeaders: HeadersInit = {}): Response {
  return Response.json(body, { status, headers: extraHeaders });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCategoriaPOI(value: unknown): value is CategoriaPOI {
  return typeof value === "string" && CATEGORIE_POI.some((categoria) => categoria === value);
}

function parseScanRequest(value: unknown): ScanPoiRequest | null {
  if (!isRecord(value)) return null;

  const { qrToken, lat, lng } = value;
  if (
    typeof qrToken !== "string" || qrToken.trim().length === 0 ||
    typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
    typeof lng !== "number" || !Number.isFinite(lng) || lng < -180 || lng > 180
  ) {
    return null;
  }

  return { qrToken: qrToken.trim(), lat, lng };
}

function distanzaMetri(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = rad(lat2 - lat1);
  const deltaLng = rad(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

function isPoiRecord(value: unknown): value is PoiRecord {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isCategoriaPOI(value.category) &&
    typeof value.latitude === "number" && Number.isFinite(value.latitude) &&
    typeof value.longitude === "number" && Number.isFinite(value.longitude) &&
    typeof value.radius_meters === "number" && Number.isFinite(value.radius_meters) && value.radius_meters > 0 &&
    typeof value.curiosity === "string" &&
    (typeof value.exclusive_photo_path === "string" || value.exclusive_photo_path === null);
}

function isScanRecord(value: unknown): value is ScanRecord {
  return isRecord(value) &&
    typeof value.poi_id === "string" &&
    typeof value.scanned_at === "string" &&
    typeof value.distance_meters === "number" && Number.isFinite(value.distance_meters);
}

function maskUserId(userId: string): string {
  return userId.length <= 8 ? "[masked]" : `${userId.slice(0, 4)}…${userId.slice(-4)}`;
}

function logError(requestId: string, scope: string, databaseCode?: string, userId?: string) {
  console.error(JSON.stringify({
    requestId,
    scope,
    ...(databaseCode ? { databaseCode } : {}),
    ...(userId ? { userId: maskUserId(userId) } : {})
  }));
}

export default {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    const userId = context.userClaims?.sub;

    // withSupabase valida il JWT prima di chiamare questo handler.
    if (!userId) {
      logError(requestId, "missing_authenticated_user");
      return jsonResponse({ error: "Sessione non valida", code: "unauthorized" }, 401);
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Metodo non consentito", code: "method_not_allowed" },
        405,
        { "Allow": "POST" }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Body JSON non valido", code: "invalid_json" }, 400);
    }

    const scanRequest = parseScanRequest(body);
    if (!scanRequest) {
      return jsonResponse({ error: "qrToken, lat e lng non sono validi", code: "invalid_input" }, 400);
    }

    try {
      const { data: poiData, error: poiError } = await context.supabaseAdmin
        .from("points_of_interest")
        .select("id, name, category, latitude, longitude, radius_meters, curiosity, exclusive_photo_path")
        .eq("qr_token", scanRequest.qrToken)
        .eq("is_active", true)
        .maybeSingle();

      if (poiError) {
        logError(requestId, "find_poi", poiError.code, userId);
        return jsonResponse({ error: "Errore interno durante la scansione", code: "internal_error" }, 500);
      }

      if (!poiData) {
        return jsonResponse({ error: "QR code non valido", code: "invalid_qr" }, 404);
      }

      if (!isPoiRecord(poiData)) {
        logError(requestId, "validate_poi_record", undefined, userId);
        return jsonResponse({ error: "Errore interno durante la scansione", code: "internal_error" }, 500);
      }

      const distanceMeters = distanzaMetri(scanRequest.lat, scanRequest.lng, poiData.latitude, poiData.longitude);
      if (!Number.isFinite(distanceMeters)) {
        logError(requestId, "calculate_distance", undefined, userId);
        return jsonResponse({ error: "Errore interno durante la scansione", code: "internal_error" }, 500);
      }

      if (distanceMeters > poiData.radius_meters) {
        return jsonResponse({
          error: "Sei troppo lontano dal punto di interesse",
          code: "out_of_range",
          distanceMeters: Math.round(distanceMeters),
          allowedRadiusMeters: poiData.radius_meters
        }, 403);
      }

      const { data: scanData, error: insertError } = await context.supabaseAdmin
        .from("scans")
        .insert({
          user_id: userId,
          poi_id: poiData.id,
          latitude: scanRequest.lat,
          longitude: scanRequest.lng,
          distance_meters: distanceMeters
        })
        .select("poi_id, scanned_at, distance_meters")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          return jsonResponse({ error: "Punto di interesse già sbloccato", code: "already_scanned" }, 409);
        }

        logError(requestId, "insert_scan", insertError.code, userId);
        return jsonResponse({ error: "Errore interno durante la scansione", code: "internal_error" }, 500);
      }

      if (!isScanRecord(scanData)) {
        logError(requestId, "validate_inserted_scan", undefined, userId);
        return jsonResponse({ error: "Errore interno durante la scansione", code: "internal_error" }, 500);
      }

      const { count: totalScans, error: countError } = await context.supabaseAdmin
        .from("scans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError || totalScans === null) {
        logError(requestId, "count_scans", countError?.code, userId);
        return jsonResponse({ error: "Errore interno durante la scansione", code: "internal_error" }, 500);
      }

      // Storage privato non è ancora configurato: non esponiamo né trasformiamo il path esclusivo.
      return jsonResponse({
        message: "Punto di interesse sbloccato",
        scan: {
          poiId: scanData.poi_id,
          scannedAt: scanData.scanned_at,
          distanceMeters: scanData.distance_meters
        },
        poi: {
          id: poiData.id,
          nome: poiData.name,
          categoria: poiData.category,
          lat: poiData.latitude,
          lng: poiData.longitude,
          curiosita: poiData.curiosity,
          fotoEsclusivaUrl: null,
          raggioMetri: poiData.radius_meters
        },
        totalScans,
        activeDiscount: calcolaSconto(totalScans)
      }, 201);
    } catch {
      logError(requestId, "unhandled_scan_error", undefined, userId);
      return jsonResponse({ error: "Errore interno durante la scansione", code: "internal_error" }, 500);
    }
  })
};
