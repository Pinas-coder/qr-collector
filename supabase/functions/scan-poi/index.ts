const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve((request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  if (!request.headers.get("Authorization")?.startsWith("Bearer ")) return Response.json({ error: "Missing authorization" }, { status: 401, headers: corsHeaders });

  // TODO: derive user identity from the verified JWT.
  // TODO: validate qr token and coordinates.
  // TODO: look up token, calculate Haversine distance and verify radius.
  // TODO: insert a scan, handle duplicate scans and return the earned reward.
  return Response.json({ error: "scan-poi is not implemented yet" }, { status: 501, headers: corsHeaders });
});
