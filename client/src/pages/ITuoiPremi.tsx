import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProfilo, getPuntiInteresse } from "../lib/api";
import type { ProfiloUtente, PuntoInteresse } from "../../../shared/types";
import AnimatedCard from "../components/AnimatedCard";
import PageTransition from "../components/PageTransition";

function formattaData(data: string): string {
  const valore = new Date(data);
  return Number.isNaN(valore.getTime()) ? "Data non disponibile" : valore.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function FotoPOI({ poi }: { poi: PuntoInteresse }) {
  const [immagineNonDisponibile, setImmagineNonDisponibile] = useState(!poi.fotoEsclusivaUrl);
  return <div className="relative h-full w-full bg-surface-container-highest">
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-on-surface-variant"><span className="material-symbols-outlined text-3xl">image</span><span className="text-xs">Foto non disponibile</span></div>
    {!immagineNonDisponibile && <img src={poi.fotoEsclusivaUrl} alt={poi.nome} className="relative h-full w-full object-cover" onError={() => setImmagineNonDisponibile(true)} />}
  </div>;
}

export default function ITuoiPremi() {
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null);
  const [poi, setPoi] = useState<PuntoInteresse[]>([]);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    Promise.all([getProfilo(), getPuntiInteresse()])
      .then(([profiloCaricato, puntiInteresse]) => { setProfilo(profiloCaricato); setPoi(puntiInteresse); })
      .catch(() => setErrore("Non è stato possibile caricare i premi. Riprova tra poco."))
      .finally(() => setCaricamento(false));
  }, []);

  const scansioniSbloccate = profilo?.qrRaccolti ?? [];
  const idSbloccati = new Set(scansioniSbloccate.map((scansione) => scansione.poiId));
  const poiBloccati = poi.filter((punto) => !idSbloccati.has(punto.id));

  return <PageTransition><div className="space-y-6 px-5 pb-6 pt-6">
    <motion.h1 className="font-display text-lg font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Il tuo premio</motion.h1>

    {caricamento && <div className="rounded-xl bg-surface-card p-6 text-center text-sm text-on-surface-variant">Caricamento premi...</div>}
    {errore && <div role="alert" className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{errore}</div>}

    {!caricamento && !errore && profilo && <>
      <AnimatedCard delay={0.1} className="relative rounded-xl border-2 border-dashed border-primary bg-surface-card p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-secondary">Sconto attivo</p>
        <motion.p className="font-display text-3xl font-extrabold text-primary" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: .6, repeat: Infinity, repeatDelay: 2 }}>{profilo.scontoAttivo}% OFF</motion.p>
        <p className="mt-2 text-sm text-on-surface-variant">Presenta questo codice in un negozio partner per riscattare lo sconto cumulativo.</p>
        <div className="mx-auto mt-4 flex h-40 items-center justify-center rounded-md bg-surface-container-highest text-on-surface-variant"><motion.span className="material-symbols-outlined text-4xl" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>qr_code</motion.span></div>
      </AnimatedCard>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-display font-semibold">Galleria sbloccata</h2><span className="rounded-full bg-primary-container/20 px-3 py-1 font-mono text-xs text-primary">{scansioniSbloccate.length} / {poi.length}</span></div>
        {scansioniSbloccate.length === 0 ? <p className="text-sm text-on-surface-variant">Nessuna foto sbloccata finora. Scansiona un QR per iniziare.</p> : <div className="grid grid-cols-2 gap-3">
          {scansioniSbloccate.map((scansione, indice) => <motion.article key={scansione.poiId} className={`relative overflow-hidden rounded-xl bg-surface-container-highest ${indice === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2 + indice * .1 }} whileHover={{ scale: 1.03 }}>
            <FotoPOI poi={scansione.poi} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3"><span className="font-mono text-[10px] uppercase text-white/80">{scansione.poi.categoria}</span><span className="block font-display text-sm font-semibold text-white">{scansione.poi.nome}</span></div>
          </motion.article>)}
        </div>}
      </section>

      <section className="space-y-2"><h2 className="font-display font-semibold">Curiosità</h2>
        {scansioniSbloccate.map((scansione, indice) => <motion.article key={scansione.poiId} className="flex items-start gap-3 rounded-xl bg-surface-card p-4 shadow-sm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2 + indice * .1 }} whileHover={{ x: 4 }}>
          <span className="material-symbols-outlined shrink-0 text-primary">menu_book</span><div><h3 className="font-display text-sm font-semibold">{scansione.poi.nome}</h3><p className="mt-1 text-xs text-on-surface-variant">{scansione.poi.curiosita}</p><p className="mt-2 font-mono text-[10px] uppercase text-outline">Scoperto il {formattaData(scansione.scansionatoIl)}</p></div>
        </motion.article>)}
        {poiBloccati.map((punto) => <div key={punto.id} className="flex items-start gap-3 rounded-xl bg-surface-container p-4 opacity-70"><span className="material-symbols-outlined shrink-0 text-outline">lock</span><div><h3 className="font-display text-sm font-semibold text-on-surface-variant">Curiosità sconosciuta</h3><p className="mt-1 text-xs text-outline">Continua a esplorare per sbloccarla.</p></div></div>)}
      </section>
    </>}
  </div></PageTransition>;
}
