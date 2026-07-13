import { useEffect, useState } from "react";
import { getProfilo } from "../lib/api";
import type { ProfiloUtente } from "../../../shared/types";
import { calcolaSconto } from "../../../shared/types";

export default function Dashboard() {
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null);

  useEffect(() => {
    getProfilo().then(setProfilo).catch(() => {});
  }, []);

  const qrRaccolti = profilo?.qrRaccolti.length ?? 0;
  const scontoAttuale = calcolaSconto(qrRaccolti);

  return (
    <div className="px-5 pt-6 space-y-6">
      <header className="flex items-center justify-between">
        <span className="font-display font-bold text-primary">
          Explorer Level {profilo?.livelloEsploratore ?? "–"}
        </span>
        <span className="material-symbols-outlined text-primary">military_tech</span>
      </header>

      <section className="bg-surface-card rounded-lg p-4 shadow-sm">
        <p className="font-mono text-xs tracking-wide text-secondary uppercase">Obiettivo attuale</p>
        <p className="font-display font-bold text-lg">Sconto {scontoAttuale}%</p>
        <div className="mt-2 h-2 rounded-full bg-surface-container-highest overflow-hidden flex gap-1">
          <div
            className="h-full bg-secondary-container rounded-full transition-all"
            style={{ width: `${Math.min(qrRaccolti * 10, 100)}%` }}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display font-semibold mb-2">Curiosità nelle vicinanze</h2>
        <p className="text-sm text-on-surface-variant">
          Scansiona un QR per sbloccare la prossima curiosità.
        </p>
      </section>
    </div>
  );
}
