import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function BottomNav() {
  return (
    <motion.nav className="fixed bottom-0 left-0 right-0 z-[900] mx-auto flex max-w-[768px] items-center justify-around border-t border-outline-variant bg-surface-container-lowest px-4 py-3" initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: .5 }}>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
            isActive ? "bg-primary-container/20 text-primary" : "text-on-surface-variant"
          }`
        }
      >
        {({ isActive }) => <><motion.span className="material-symbols-outlined" animate={{ scale: isActive ? 1.2 : 1 }}>map</motion.span>
        Mappa
        {isActive && <motion.span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" layoutId="activeIndicator" />}</>}
      </NavLink>

      <NavLink
        to="/scansiona"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
            isActive ? "bg-primary-container/20 text-primary" : "text-on-surface-variant"
          }`
        }
      >
        {({ isActive }) => <><motion.span className="material-symbols-outlined" data-weight="fill" animate={{ scale: isActive ? 1.2 : 1 }}>qr_code_scanner</motion.span>
        Scan
        {isActive && <motion.span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" layoutId="activeIndicator" />}</>}
      </NavLink>

      <NavLink
        to="/premi"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
            isActive ? "bg-primary-container/20 text-primary" : "text-on-surface-variant"
          }`
        }
      >
        {({ isActive }) => <><motion.span className="material-symbols-outlined" animate={{ scale: isActive ? 1.2 : 1 }}>military_tech</motion.span>
        Premi
        {isActive && <motion.span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" layoutId="activeIndicator" />}</>}
      </NavLink>

      <NavLink
        to="/profilo"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
            isActive ? "bg-primary-container/20 text-primary" : "text-on-surface-variant"
          }`
        }
      >
        {({ isActive }) => <><motion.span className="material-symbols-outlined" animate={{ scale: isActive ? 1.2 : 1 }}>person</motion.span>
        Profilo
        {isActive && <motion.span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" layoutId="activeIndicator" />}</>}
      </NavLink>
    </motion.nav>
  );
}
