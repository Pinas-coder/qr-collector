import { withSupabase } from "npm:@supabase/server@^1";
import { calcolaSconto } from "../_shared/rewards.ts";

type CategoriaPOI = "Storia" | "Natura" | "Cultura" | "Bonus";

interface ProfileRecord {
  id: string;
  explorer_level: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

interface ScanRecord {
  poi_id: string;
  scanned_at: string;
  distance_meters: number;
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
  is_active: boolean;
}

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

function isProfileRecord(value: unknown): value is ProfileRecord {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.explorer_level === "number" && Number.isFinite(value.explorer_level) &&
    typeof value.streak_days === "number" && Number.isFinite(value.streak_days) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string";
}

function isScanRecord(value: unknown): value is ScanRecord {
  return isRecord(value) &&
    typeof value.poi_id === "string" &&
    typeof value.scanned_at === "string" &&
    typeof value.distance_meters === "number" && Number.isFinite(value.distance_meters);
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
    (typeof value.exclusive_photo_path === "string" || value.exclusive_photo_path === null) &&
    typeof value.is_active === "boolean";
}

function maskUserId(userId: string): string {
  return userId.length <= 8 ? "[masked]" : `${userId.slice(0, 4)}…${userId.slice(-4)}`;
}

function logWarning(requestId: string, scope: string, userId: string) {
  console.warn(JSON.stringify({ requestId, scope, userId: maskUserId(userId) }));
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
  fetch: withSupabase({ auth: "user" }, async (request, context): Promise<Response> => {
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    const userId = context.userClaims?.sub;

    if (!userId) {
      logError(requestId, "missing_authenticated_user");
      return jsonResponse({ error: "Sessione non valida", code: "unauthorized" }, 401);
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Metodo non consentito", code: "method_not_allowed" },
        405,
        { Allow: "POST" }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Body JSON non valido", code: "invalid_json" }, 400);
    }

    if (!isRecord(body) || Object.keys(body).length !== 0) {
      return jsonResponse({ error: "Il body della richiesta deve essere vuoto", code: "invalid_input" }, 400);
    }

    try {
      const { data: existingProfile, error: profileError } = await context.supabaseAdmin
        .from("profiles")
        .select("id, explorer_level, streak_days, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        logError(requestId, "read_profile", profileError.code, userId);
        return jsonResponse({ error: "Errore interno durante il caricamento del profilo", code: "internal_error" }, 500);
      }

      let profileData: unknown = existingProfile;
      if (!profileData) {
        const { data: fallbackProfile, error: fallbackError } = await context.supabaseAdmin
          .from("profiles")
          .insert({ id: userId, explorer_level: 1, streak_days: 0 })
          .select("id, explorer_level, streak_days, created_at, updated_at")
          .single();

        if (fallbackError && fallbackError.code !== "23505") {
          logError(requestId, "create_profile_fallback", fallbackError.code, userId);
          return jsonResponse({ error: "Errore interno durante il caricamento del profilo", code: "internal_error" }, 500);
        }

        profileData = fallbackProfile;

        if (fallbackError?.code === "23505") {
          const { data: profileAfterConflict, error: profileAfterConflictError } = await context.supabaseAdmin
            .from("profiles")
            .select("id, explorer_level, streak_days, created_at, updated_at")
            .eq("id", userId)
            .single();

          if (profileAfterConflictError) {
            logError(requestId, "read_profile_after_conflict", profileAfterConflictError.code, userId);
            return jsonResponse({ error: "Errore interno durante il caricamento del profilo", code: "internal_error" }, 500);
          }

          profileData = profileAfterConflict;
        }
      }

      if (!isProfileRecord(profileData) || profileData.id !== userId) {
        logError(requestId, "validate_profile", undefined, userId);
        return jsonResponse({ error: "Errore interno durante il caricamento del profilo", code: "internal_error" }, 500);
      }

      const { data: rawScans, error: scansError } = await context.supabaseAdmin
        .from("scans")
        .select("poi_id, scanned_at, distance_meters")
        .eq("user_id", userId)
        .order("scanned_at", { ascending: false });

      if (scansError) {
        logError(requestId, "read_scans", scansError.code, userId);
        return jsonResponse({ error: "Errore interno durante il caricamento del profilo", code: "internal_error" }, 500);
      }

      const scansioni = Array.isArray(rawScans) ? rawScans.flatMap((scan: unknown) => {
        if (isScanRecord(scan)) return [scan];
        logWarning(requestId, "ignore_invalid_scan", userId);
        return [];
      }) : [];

      const poiIds = [...new Set(scansioni.map((scan) => scan.poi_id))];
      let rawPoi: unknown[] = [];

      if (poiIds.length > 0) {
        const { data: poiData, error: poiError } = await context.supabaseAdmin
          .from("points_of_interest")
          .select("id, name, category, latitude, longitude, radius_meters, curiosity, exclusive_photo_path, is_active")
          .in("id", poiIds);

        if (poiError) {
          logError(requestId, "read_unlocked_pois", poiError.code, userId);
          return jsonResponse({ error: "Errore interno durante il caricamento del profilo", code: "internal_error" }, 500);
        }

        rawPoi = Array.isArray(poiData) ? poiData : [];
      }

      const poiPerId = new Map<string, PoiRecord>();
      for (const poi of rawPoi) {
        if (!isPoiRecord(poi)) {
          logWarning(requestId, "ignore_invalid_poi", userId);
          continue;
        }
        poiPerId.set(poi.id, poi);
      }

      const qrRaccolti = scansioni.flatMap((scansione) => {
        const poi = poiPerId.get(scansione.poi_id);
        if (!poi) {
          logWarning(requestId, "ignore_orphan_scan", userId);
          return [];
        }

        return [{
          poiId: scansione.poi_id,
          scansionatoIl: scansione.scanned_at,
          poi: {
            id: poi.id,
            nome: poi.name,
            categoria: poi.category,
            lat: poi.latitude,
            lng: poi.longitude,
            curiosita: poi.curiosity,
            fotoEsclusivaUrl: null,
            raggioMetri: poi.radius_meters
          }
        }];
      });

      const totaleScansioni = qrRaccolti.length;
      const livelloEsploratore = 1 + Math.floor(totaleScansioni / 2);

      return jsonResponse({
        id: userId,
        livelloEsploratore,
        qrRaccolti,
        streakGiorni: profileData.streak_days,
        scontoAttivo: calcolaSconto(totaleScansioni),
        totaleScansioni
      }, 200);
    } catch {
      logError(requestId, "unhandled_rewards_profile_error", undefined, userId);
      return jsonResponse({ error: "Errore interno durante il caricamento del profilo", code: "internal_error" }, 500);
    }
  })
};
