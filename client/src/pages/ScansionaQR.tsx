import { useState } from "react";
import { scansionaQR } from "../lib/api";

export default function ScansionaQR() {
  const [codice, setCodice] = useState("");
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  function getPosizione(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalizzazione non supportata dal browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000
      });
    });
  }

  async function handleInserisciCodice() {
    setInCorso(true);
    setMessaggio(null);
    try {
      const posizione = await getPosizione();
      const { poi, nuovoSconto } = await scansionaQR(
        codice,
        posizione.coords.latitude,
        posizione.coords.longitude
      );
      setMessaggio(`Sbloccato: ${poi.nome} — nuovo sconto ${nuovoSconto}%`);
    } catch (err) {
      if (err instanceof GeolocationPositionError || (err as Error)?.message?.includes("Geolocalizzazione")) {
        setMessaggio("Attiva la geolocalizzazione per scansionare un QR.");
      } else {
        setMessaggio("Codice non valido, già scansionato, o troppo lontano dal punto di interesse.");
      }
    } finally {
      setInCorso(false);
    }
  }

  return (
    <div className="px-5 pt-6 space-y-4">
      <h1 className="font-display font-bold text-lg">Inquadra il QR code</h1>
      <p className="text-sm text-on-surface-variant">al punto di interesse</p>

      <div className="aspect-square bg-surface-container-highest rounded-lg flex items-center justify-center text-on-surface-variant">
        Anteprima fotocamera
      </div>

      <div className="flex gap-2">
        <input
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
          placeholder="Inserisci codice manualmente"
          className="flex-1 rounded-md border-2 border-outline-variant focus:border-primary px-3 py-2 font-mono text-sm"
        />
        <button
          onClick={handleInserisciCodice}
          disabled={inCorso}
          className="rounded-full bg-primary text-on-primary px-4 py-2 font-display font-semibold disabled:opacity-50"
        >
          {inCorso ? "..." : "Sblocca"}
        </button>
      </div>

      {messaggio && <p className="text-sm font-medium text-primary">{messaggio}</p>}
    </div>
  );
}