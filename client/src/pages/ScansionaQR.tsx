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
    <div className="fixed inset-0 bg-ink-dark text-white flex flex-col items-center justify-center gap-6 px-6 z-40">
      <div className="text-center">
        <p className="font-display font-bold text-lg">Inquadra il QR code</p>
        <p className="text-white/70 text-sm mt-1">al punto di interesse</p>
      </div>

      <div className="relative w-64 h-64 rounded-xl overflow-hidden bg-black/30">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
      </div>

      <div className="w-full max-w-xs flex gap-2">
        <input
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
          placeholder="Inserisci codice manualmente"
          className="flex-1 rounded-md border-2 border-white/30 bg-white/10 focus:border-primary px-3 py-2 font-mono text-sm text-white placeholder:text-white/50"
        />
        <button
          onClick={handleInserisciCodice}
          className="rounded-full bg-primary text-on-primary px-4 py-2 font-display font-semibold"
        >
          Sblocca
        </button>
      </div>

      {messaggio && <p className="text-sm font-medium text-primary-fixed-dim">{messaggio}</p>}
    </div>
  );
}