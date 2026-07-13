import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/mappa", label: "Mappa", icon: "map" },
  { to: "/scansiona", label: "Scansiona", icon: "qr_code_scanner" },
  { to: "/premi", label: "Premi", icon: "military_tech" },
  { to: "/", label: "Profilo", icon: "person" }
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[768px] bg-surface-container-lowest border-t border-outline-variant flex justify-around py-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 rounded-md text-xs font-display font-semibold ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`
          }
        >
          <span className="material-symbols-outlined">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
