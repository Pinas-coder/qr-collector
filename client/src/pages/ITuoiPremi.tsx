import { useEffect, useState } from "react";
import { getProfilo } from "../lib/api";
import type { ProfiloUtente } from "../../../shared/types";
import { calcolaSconto } from "../../../shared/types";

export default function ITuoiPremi() {
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null);

  useEffect(() => {
    getProfilo().then(setProfilo).catch(() => {});
  }, []);

  const sconto = calcolaSconto(profilo?.qrRaccolti.length ?? 0);

  return (
    <div className="px-5 pt-6 space-y-6">
      <h1 className="font-display font-bold text-lg">Il tuo premio</h1>

      <div className="relative bg-surface-card rounded-xl border-2 border-dashed border-primary p-6 text-center">
        <p className="font-mono text-xs text-secondary uppercase tracking-wide">Sconto attivo</p>
        <p className="font-display font-extrabold text-3xl text-primary">{sconto}% OFF</p>
        <p className="text-sm text-on-surface-variant mt-2">
          Presenta questo codice in un negozio partner per riscattare lo sconto cumulativo.
        </p>
        <div className="mt-4 h-40 bg-surface-container-highest rounded-md mx-auto flex items-center justify-center text-on-surface-variant text-sm">
          QR sconto
        </div>
      </div>

      <section>
        <h2 className="font-display font-semibold mb-2">Galleria sbloccata</h2>
        <p className="text-sm text-on-surface-variant">
          {profilo?.qrRaccolti.length ?? 0} foto esclusive sbloccate finora.
        </p>
      </section>
    </div>
  );
}