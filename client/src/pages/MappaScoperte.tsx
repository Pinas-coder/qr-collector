import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getPuntiInteresse } from "../lib/api";
import type { PuntoInteresse } from "../../../shared/types";

export default function MappaScoperte() {
  const [poi, setPoi] = useState<PuntoInteresse[]>([]);

  useEffect(() => {
    getPuntiInteresse().then(setPoi).catch(() => {});
  }, []);

  const centro: [number, number] = poi.length
    ? [poi[0].lat, poi[0].lng]
    : [38.9989, 16.5033]; // fallback: Catanzaro

  return (
    <div className="h-[calc(100vh-72px)]">
      <MapContainer center={centro} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {poi.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{p.nome}</strong>
              <br />
              {p.categoria}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
