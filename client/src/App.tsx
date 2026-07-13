import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MappaScoperte from "./pages/MappaScoperte";
import ScansionaQR from "./pages/ScansionaQR";
import ITuoiPremi from "./pages/ITuoiPremi";
import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mappa" element={<MappaScoperte />} />
        <Route path="/scansiona" element={<ScansionaQR />} />
        <Route path="/premi" element={<ITuoiPremi />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
