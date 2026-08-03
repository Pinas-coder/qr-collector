import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MappaScoperte from "./pages/MappaScoperte";
import ScansionaQR from "./pages/ScansionaQR";
import ITuoiPremi from "./pages/ITuoiPremi";
import BottomNav from "./components/BottomNav";
import { ensureAnonymousSession } from "./lib/supabase";

type AuthState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

function AuthStatus({ state, onRetry }: { state: Exclude<AuthState, { status: "ready" }>; onRetry: () => void }) {
  const isLoading = state.status === "loading";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-5">
      <motion.div
        className="w-full max-w-sm rounded-xl bg-surface-card p-6 text-center shadow-lg"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {isLoading ? (
          <>
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
            <h1 className="mt-4 font-display text-lg font-semibold">Preparazione dell'esperienza</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Creazione o recupero della sessione anonima...</p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-4xl text-error">cloud_off</span>
            <h1 className="mt-3 font-display text-lg font-semibold">Connessione non disponibile</h1>
            <p role="alert" className="mt-2 text-sm text-on-surface-variant">{state.message}</p>
            <button type="button" onClick={onRetry} className="mt-5 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-semibold text-on-primary">
              Riprova
            </button>
          </>
        )}
      </motion.div>
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [authAttempt, setAuthAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setAuthState({ status: "loading" });

    ensureAnonymousSession()
      .then(() => {
        if (active) setAuthState({ status: "ready" });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Errore inatteso durante l'inizializzazione di Supabase.";
        setAuthState({ status: "error", message });
      });

    return () => {
      active = false;
    };
  }, [authAttempt]);

  if (authState.status !== "ready") {
    return <AuthStatus state={authState} onRetry={() => setAuthAttempt((attempt) => attempt + 1)} />;
  }

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MappaScoperte />} />
        <Route path="/profilo" element={<Dashboard />} />
        <Route path="/scansiona" element={<ScansionaQR />} />
        <Route path="/premi" element={<ITuoiPremi />} />
      </Routes>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
