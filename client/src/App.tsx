import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MappaScoperte from "./pages/MappaScoperte";
import ScansionaQR from "./pages/ScansionaQR";
import ITuoiPremi from "./pages/ITuoiPremi";
import BottomNav from "./components/BottomNav";

export default function App() {
  const location = useLocation();
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
