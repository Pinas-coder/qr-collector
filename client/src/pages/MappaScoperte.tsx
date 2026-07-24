import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getProfilo, getPuntiInteresse } from "../lib/api";
import type { ProfiloUtente, PuntoInteresse } from "../../../shared/types";
import CustomMarker from "../components/CustomMarker";
import MapLegend from "../components/MapLegend";
import PageTransition from "../components/PageTransition";

export default function MappaScoperte() {
  const [poi, setPoi] = useState<PuntoInteresse[]>([]);
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([getPuntiInteresse().then(setPoi), getProfilo().then(setProfilo)]).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const centro: [number, number] = poi.length ? [poi[0].lat, poi[0].lng] : [38.9989, 16.5033];
  const idSbloccati = new Set(profilo?.qrRaccolti.map((q) => q.poiId) ?? []);

  return <PageTransition><div className="relative z-0 h-[calc(100vh-72px)] bg-surface">
    <MapContainer center={centro} zoom={14} className="h-full w-full" zoomControl={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" maxZoom={19} />
      <ZoomControl position="topright" />
      {poi.map((p) => <CustomMarker key={p.id} poi={p} isUnlocked={idSbloccati.has(p.id)} />)}
    </MapContainer>
    <MapLegend />
    <div className="absolute left-4 top-4 z-[500] rounded-xl border border-outline-variant bg-surface-card p-3 shadow-lg"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">location_on</span><div><p className="font-mono text-xs uppercase text-on-surface-variant">Punti di interesse</p><p className="font-display font-bold">{profilo?.qrRaccolti.length ?? 0} / {poi.length}</p></div></div></div>
    {loading && <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20"><div className="flex flex-col items-center gap-3 rounded-xl bg-surface-card p-6"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" /><p className="font-display text-sm">Caricamento mappa...</p></div></div>}
  </div></PageTransition>;
}
