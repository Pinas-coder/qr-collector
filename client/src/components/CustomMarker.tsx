import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { PuntoInteresse } from "../../../shared/types";

const categoryColors: Record<string, string> = {
  Storia: "#006b5c", Natura: "#00C853", Cultura: "#fd6c00", Bonus: "#9f4200"
};

function createIcon(categoria: string, unlocked: boolean) {
  const color = unlocked ? (categoryColors[categoria] ?? "#006b5c") : "#bbcac4";
  return L.divIcon({
    className: "custom-marker",
    iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
    html: `<div style="width:40px;height:40px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:${unlocked ? 1 : 0.6};box-shadow:0 2px 8px rgba(0,0,0,.2);font:20px 'Material Symbols Outlined';color:white">${unlocked ? "location_on" : "lock"}</div>`
  });
}

export default function CustomMarker({ poi, isUnlocked }: { poi: PuntoInteresse; isUnlocked: boolean }) {
  return (
    <Marker position={[poi.lat, poi.lng]} icon={createIcon(poi.categoria, isUnlocked)}>
      <Popup>
        <div className="w-48">
          <div className="mb-2 h-32 overflow-hidden rounded-lg bg-surface-container-highest">
            {isUnlocked ? <img src={poi.fotoEsclusivaUrl} alt={poi.nome} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="material-symbols-outlined text-2xl">lock</span></div>}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">{poi.categoria}</p>
          <h3 className="font-display text-sm font-semibold text-on-surface">{poi.nome}</h3>
          <p className="mt-2 text-xs text-on-surface-variant">{isUnlocked ? poi.curiosita : "Scansiona il QR per sbloccare questa curiosità."}</p>
        </div>
      </Popup>
    </Marker>
  );
}
