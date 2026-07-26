import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getProfilo, getPuntiInteresse } from "../lib/api";
import type { AnteprimaPuntoInteresse, ProfiloUtente } from "../../../shared/types";
import CustomMarker from "../components/CustomMarker";
import MapLegend from "../components/MapLegend";
import PageTransition from "../components/PageTransition";

const SARDEGNA_BOUNDS: LatLngBoundsExpression = [[38.75, 7.75], [41.45, 10.15]];

export default function MappaScoperte() {
  const [poi, setPoi] = useState<AnteprimaPuntoInteresse[]>([]);
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const ricaricaDati = useCallback(async () => {
    setLoading(true); setErrore(null);
    try {
      const [puntiInteresse, profiloUtente] = await Promise.all([getPuntiInteresse(), getProfilo()]);
      setPoi(puntiInteresse); setProfilo(profiloUtente);
    } catch {
      setErrore("Non è stato possibile caricare i punti di interesse.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void ricaricaDati(); }, [ricaricaDati]);

  const sbloccati = new Map(profilo?.qrRaccolti.map((scansione) => [scansione.poiId, scansione.poi]) ?? []);

  return <PageTransition><div className="relative z-0 h-[calc(100dvh-72px)] bg-surface">
    <MapContainer bounds={SARDEGNA_BOUNDS} boundsOptions={{ padding: [16, 16] }} minZoom={7} maxZoom={18} maxBounds={SARDEGNA_BOUNDS} maxBoundsViscosity={1} className="h-full w-full" zoomControl={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" maxZoom={19} />
      <ZoomControl position="topright" />
      {poi.map((punto) => <CustomMarker key={punto.id} poi={punto} poiSbloccato={sbloccati.get(punto.id)} />)}
    </MapContainer>
    <MapLegend />
    <div className="absolute left-4 top-4 z-[500] rounded-xl border border-outline-variant bg-surface-card p-3 shadow-lg"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">location_on</span><div><p className="font-mono text-xs uppercase text-on-surface-variant">Punti di interesse</p><p className="font-display font-bold">{profilo?.qrRaccolti.length ?? 0} / {poi.length}</p></div></div></div>
    {loading && <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20"><div className="flex flex-col items-center gap-3 rounded-xl bg-surface-card p-6"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" /><p className="font-display text-sm">Caricamento mappa...</p></div></div>}
    {errore && <div role="alert" className="absolute left-4 right-4 top-4 z-[1000] rounded-xl border border-error/30 bg-surface-card p-4 shadow-lg"><p className="font-display font-semibold">Mappa non disponibile</p><p className="mt-1 text-sm text-on-surface-variant">{errore}</p><button onClick={() => void ricaricaDati()} className="mt-3 text-sm font-semibold text-primary">Riprova</button></div>}
  </div></PageTransition>;
}
