import { NavLink, useNavigate } from "react-router-dom";

const tabs = [
  { to: "/mappa", label: "Mappa", icon: "map" },
  { to: "/premi", label: "Premi", icon: "military_tech" },
  { to: "/", label: "Profilo", icon: "person" }
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate("/scansiona")}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-16 h-16 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center active:scale-90 transition-transform border-4 border-surface"
        aria-label="Scansiona QR"
      >
        <span className="material-symbols-outlined text-[32px]" data-weight="fill">
          qr_code_scanner
        </span>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[768px] bg-surface-container-lowest border-t border-outline-variant flex justify-around items-center px-4 py-3">
        <NavLink
          to="/mappa"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
              isActive ? "bg-primary-container/20 text-primary" : "text-on-surface-variant"
            }`
          }
        >
          <span className="material-symbols-outlined">map</span>
          Mappa
        </NavLink>

        {/* spazio invisibile per il FAB */}
        <div className="w-16" />

        <NavLink
          to="/premi"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
              isActive ? "bg-primary-container/20 text-primary" : "text-on-surface-variant"
            }`
          }
        >
          <span className="material-symbols-outlined">military_tech</span>
          Premi
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
              isActive ? "bg-primary-container/20 text-primary" : "text-on-surface-variant"
            }`
          }
        >
          <span className="material-symbols-outlined">person</span>
          Profilo
        </NavLink>
      </nav>
    </>
  );
}