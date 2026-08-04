import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProfilo } from "../lib/api";
import type { ProfiloUtente } from "../../../shared/types";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedProgressBar from "../components/AnimatedProgressBar";
import PageTransition from "../components/PageTransition";

export default function Dashboard() {
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null);
  useEffect(() => { getProfilo().then(setProfilo).catch(() => {}); }, []);
  const qrRaccolti = profilo?.totaleScansioni ?? 0;
  const scontoAttuale = profilo?.scontoAttivo ?? 0;
  return <PageTransition><div className="space-y-6 px-5 pb-6 pt-6">
    <motion.header className="flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><div><p className="font-mono text-xs uppercase tracking-wide text-on-surface-variant">Il tuo livello</p><h1 className="font-display text-2xl font-bold text-primary">Explorer Level {profilo?.livelloEsploratore ?? "–"}</h1></div><motion.span className="material-symbols-outlined text-4xl text-primary" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>military_tech</motion.span></motion.header>
    <AnimatedCard delay={.1} className="rounded-xl border border-surface-container-low bg-surface-card p-6 shadow-sm"><div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-xs uppercase tracking-wide text-secondary">Obiettivo attuale</p><h2 className="font-display text-2xl font-bold text-primary">Sconto {scontoAttuale}%</h2></div><motion.span className="font-display text-4xl font-extrabold text-primary" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: .5, repeat: Infinity, repeatDelay: 2 }}>{qrRaccolti}<span className="text-lg text-outline-variant">/13</span></motion.span></div><AnimatedProgressBar current={qrRaccolti} total={13} /></AnimatedCard>
    <AnimatedCard delay={.2}><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Curiosità nelle vicinanze</h2><span className="material-symbols-outlined text-primary">explore</span></div><p className="text-sm text-on-surface-variant">Scansiona un QR per sbloccare la prossima curiosità.</p></AnimatedCard>
    <div className="grid grid-cols-2 gap-3"><AnimatedCard delay={.3} className="rounded-xl bg-primary-container/20 p-4 text-center"><p className="font-mono text-xs uppercase text-on-surface-variant">Streak</p><p className="font-display text-2xl font-bold text-primary">{profilo?.streakGiorni ?? 0}</p><p className="text-xs text-on-surface-variant">giorni</p></AnimatedCard><AnimatedCard delay={.4} className="rounded-xl bg-secondary-container/20 p-4 text-center"><p className="font-mono text-xs uppercase text-on-surface-variant">Totale</p><p className="font-display text-2xl font-bold text-secondary">{qrRaccolti}</p><p className="text-xs text-on-surface-variant">QR scansionati</p></AnimatedCard></div>
  </div></PageTransition>;
}
