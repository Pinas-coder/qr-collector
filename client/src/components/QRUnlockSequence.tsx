import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props { isVisible: boolean; poiName: string; nuovoSconto: number; onComplete: () => void; }

export default function QRUnlockSequence({ isVisible, poiName, nuovoSconto, onComplete }: Props) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!isVisible) { setStep(0); return; }
    const timers = [setTimeout(() => setStep(1), 300), setTimeout(() => setStep(2), 800), setTimeout(onComplete, 2200)];
    return () => timers.forEach(clearTimeout);
  }, [isVisible, onComplete]);

  return <AnimatePresence>{isVisible && <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="relative flex flex-col items-center gap-6 text-center">
      <motion.div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: .5 }}>
        <span className="material-symbols-outlined text-5xl">{step ? "check_circle" : "lock_open"}</span>
      </motion.div>
      {step >= 1 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><h2 className="font-display text-xl font-bold text-white">Sblocco riuscito!</h2><p className="mt-2 text-sm text-white/80">{poiName}</p></motion.div>}
      {step >= 2 && <motion.div className="rounded-xl bg-secondary-container px-6 py-3" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}><p className="font-mono text-xs uppercase text-on-secondary-container">Nuovo sconto</p><p className="font-display text-2xl font-bold text-on-secondary-container">{nuovoSconto}% OFF</p></motion.div>}
    </div>
  </motion.div>}</AnimatePresence>;
}
