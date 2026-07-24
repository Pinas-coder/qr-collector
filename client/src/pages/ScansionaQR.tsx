import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { ApiError, scansionaQR } from "../lib/api";
import PageTransition from "../components/PageTransition";
import QRUnlockSequence from "../components/QRUnlockSequence";

export default function ScansionaQR() {
  const [codice, setCodice] = useState(""); const [messaggio, setMessaggio] = useState<string | null>(null); const [inCorso, setInCorso] = useState(false); const [camera, setCamera] = useState(false); const [unlock, setUnlock] = useState({ visible: false, nome: "", sconto: 0 });
  const scanner = useRef<Html5Qrcode | null>(null);
  const posizione = () => new Promise<GeolocationPosition>((resolve, reject) => { if (!navigator.geolocation) return reject(new Error("Geolocalizzazione non supportata")); navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 }); });
  const invia = useCallback(async (token: string) => { const qr = token.trim(); if (!qr) return setMessaggio("Inserisci o inquadra un codice QR."); setInCorso(true); setMessaggio(null); try { const pos = await posizione(); const { poi, nuovoSconto } = await scansionaQR(qr, pos.coords.latitude, pos.coords.longitude); setCodice(""); setUnlock({ visible: true, nome: poi.nome, sconto: nuovoSconto }); } catch (err) { if (err instanceof GeolocationPositionError || (err as Error).message.includes("Geolocalizzazione")) setMessaggio("Attiva la geolocalizzazione per scansionare un QR."); else if (err instanceof ApiError) setMessaggio(err.message); else setMessaggio("Non è stato possibile elaborare il QR. Riprova tra poco."); } finally { setInCorso(false); } }, []);
  const ferma = useCallback(async () => { if (scanner.current?.isScanning) await scanner.current.stop(); setCamera(false); }, []);
  const avvia = useCallback(async () => { setMessaggio(null); try { const reader = new Html5Qrcode("lettore-qr"); scanner.current = reader; await reader.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 230, height: 230 } }, async (text) => { await ferma(); setCodice(text); await invia(text); }, () => undefined); setCamera(true); } catch { setMessaggio("Impossibile avviare la fotocamera. Verifica il permesso del browser."); } }, [ferma, invia]);
  useEffect(() => () => { if (scanner.current?.isScanning) void scanner.current.stop(); }, []);
  return <PageTransition><div className="space-y-4 px-5 pb-6 pt-6"><motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><h1 className="font-display text-lg font-bold">Inquadra il QR code</h1><p className="text-sm text-on-surface-variant">al punto di interesse</p></motion.header>
    <motion.div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}><div id="lettore-qr" className={`w-full ${camera ? "block" : "hidden"}`} />{!camera && <button onClick={() => void avvia()} className="rounded-full bg-primary px-5 py-3 font-display font-semibold text-on-primary">Attiva fotocamera</button>}</motion.div>
    {camera && <button onClick={() => void ferma()} className="text-sm font-semibold text-primary">Chiudi fotocamera</button>}
    <div className="flex gap-2"><input value={codice} onChange={(e) => setCodice(e.target.value)} placeholder="Inserisci codice manualmente" className="flex-1 rounded-md border-2 border-outline-variant px-3 py-2 font-mono text-sm focus:border-primary" /><button onClick={() => void invia(codice)} disabled={inCorso || !codice.trim()} className="rounded-full bg-primary px-4 py-2 font-display font-semibold text-on-primary disabled:opacity-50">{inCorso ? "…" : "Sblocca"}</button></div>
    {messaggio && <motion.p className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm font-medium text-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{messaggio}</motion.p>}
    <div className="space-y-1 pt-4 text-xs text-on-surface-variant"><p className="font-mono uppercase tracking-wide">Suggerimenti</p><p>Assicurati che il QR sia ben illuminato e abilita la geolocalizzazione.</p></div>
  </div><QRUnlockSequence isVisible={unlock.visible} poiName={unlock.nome} nuovoSconto={unlock.sconto} onComplete={() => setUnlock((state) => ({ ...state, visible: false }))} /></PageTransition>;
}
