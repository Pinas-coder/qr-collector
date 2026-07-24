import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProfilo, getPuntiInteresse } from "../lib/api";
import type { ProfiloUtente, PuntoInteresse } from "../../../shared/types";
import { calcolaSconto } from "../../../shared/types";
import AnimatedCard from "../components/AnimatedCard";
import PageTransition from "../components/PageTransition";

export default function ITuoiPremi() {
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null);
  const [poi, setPoi] = useState<PuntoInteresse[]>([]);

  useEffect(() => {
    getProfilo().then(setProfilo).catch(() => {});
    getPuntiInteresse().then(setPoi).catch(() => {});
  }, []);

  const sconto = calcolaSconto(profilo?.qrRaccolti.length ?? 0);
  const idSbloccati = new Set(profilo?.qrRaccolti.map((q) => q.poiId) ?? []);
  const poiSbloccati = poi.filter((p) => idSbloccati.has(p.id));
  const poiBloccati = poi.filter((p) => !idSbloccati.has(p.id));

  return <PageTransition>
    <div className="px-5 pt-6 space-y-6 pb-6">
      <motion.h1 className="font-display font-bold text-lg" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Il tuo premio</motion.h1>

      <AnimatedCard delay={0.1} className="relative bg-surface-card rounded-xl border-2 border-dashed border-primary p-6 text-center">
        <p className="font-mono text-xs text-secondary uppercase tracking-wide">Sconto attivo</p>
        <motion.p className="font-display font-extrabold text-3xl text-primary" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: .6, repeat: Infinity, repeatDelay: 2 }}>{sconto}% OFF</motion.p>
        <p className="text-sm text-on-surface-variant mt-2">
          Presenta questo codice in un negozio partner per riscattare lo sconto cumulativo.
        </p>
        <div className="mt-4 h-40 bg-surface-container-highest rounded-md mx-auto flex items-center justify-center text-on-surface-variant text-sm">
          <motion.span className="material-symbols-outlined text-4xl" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>qr_code</motion.span>
        </div>
      </AnimatedCard>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display font-semibold">Galleria sbloccata</h2>
          <span className="font-mono text-xs text-primary bg-primary-container/20 px-3 py-1 rounded-full">
            {poiSbloccati.length} / {poi.length}
          </span>
        </div>

        {poiSbloccati.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Nessuna foto sbloccata finora. Scansiona un QR per iniziare.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {poiSbloccati.map((p, i) => (
              <motion.div
                key={p.id}
                className={`relative rounded-xl overflow-hidden bg-surface-container-highest ${
                  i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
                }`}
                initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2 + i * .1 }} whileHover={{ scale: 1.03 }}
              >
                <img
                  src={p.fotoEsclusivaUrl}
                  alt={p.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                  <span className="font-mono text-[10px] text-white/80 uppercase">{p.categoria}</span>
                  <span className="font-display font-semibold text-white text-sm">{p.nome}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-display font-semibold">Curiosità</h2>

        {poiSbloccati.map((p, i) => (
          <motion.div key={p.id} className="bg-surface-card p-4 rounded-xl flex items-start gap-3 shadow-sm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2 + i * .1 }} whileHover={{ x: 4 }}>
            <span className="material-symbols-outlined text-primary shrink-0">menu_book</span>
            <div>
              <h3 className="font-display font-semibold text-sm">{p.nome}</h3>
              <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{p.curiosita}</p>
            </div>
          </motion.div>
        ))}

        {poiBloccati.map((p) => (
          <div key={p.id} className="bg-surface-container p-4 rounded-xl flex items-start gap-3 opacity-70">
            <span className="material-symbols-outlined text-outline shrink-0">lock</span>
            <div>
              <h3 className="font-display font-semibold text-sm text-on-surface-variant">Curiosità sconosciuta</h3>
              <p className="text-xs text-outline mt-1">Continua a esplorare per sbloccarla.</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  </PageTransition>;
}
