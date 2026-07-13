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
        <h1 className="font-display font-bold text-primary text-lg">
          Explorer Level {profilo?.livelloEsploratore ?? "–"}
        </h1>
        <span className="material-symbols-outlined text-primary">military_tech</span>
      </header>

      <section className="bg-surface-card rounded-xl p-4 shadow-sm border border-surface-container-low">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="font-mono text-xs tracking-wide text-secondary uppercase">Obiettivo attuale</p>
            <h2 className="font-display font-bold text-lg">Sconto {scontoAttuale}%</h2>
          </div>
          <span className="font-display font-extrabold text-3xl text-primary">
            {qrRaccolti}
            <span className="text-outline-variant text-lg">/13</span>
          </span>
        </div>
        <div className="h-3 rounded-full bg-surface-container-highest overflow-hidden">
          <div
            className="h-full bg-secondary-container rounded-full transition-all"
            style={{ width: `${Math.min((qrRaccolti / 13) * 100, 100)}%` }}
          />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display font-semibold">Curiosità nelle vicinanze</h2>
        </div>
        <p className="text-sm text-on-surface-variant">
          Scansiona un QR per sbloccare la prossima curiosità.
        </p>
      </section>
    </div>
  );
}