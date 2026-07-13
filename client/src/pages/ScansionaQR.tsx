import { useState } from "react";
import { scansionaQR } from "../lib/api";

export default function ScansionaQR() {
  const [codice, setCodice] = useState("");
  const [messaggio, setMessaggio] = useState<string | null>(null);

  async function handleInserisciCodice() {
    try {
      const { poi, nuovoSconto } = await scansionaQR(codice);
      setMessaggio(`Sbloccato: ${poi.nome} — nuovo sconto ${nuovoSconto}%`);
    } catch {
      setMessaggio("Codice non valido o già scansionato.");
    }
  }

  return (
    <div className="px-5 pt-6 space-y-4">
      <h1 className="font-display font-bold text-lg">Inquadra il QR code</h1>
      <p className="text-sm text-on-surface-variant">al punto di interesse</p>

      {/* TODO: sostituire con vero scanner (es. libreria qr-scanner) che usa getUserMedia */}
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
          className="rounded-full bg-primary text-on-primary px-4 py-2 font-display font-semibold"
        >
          Sblocca
        </button>
      </div>

      {messaggio && <p className="text-sm font-medium text-primary">{messaggio}</p>}
    </div>
  );
}
