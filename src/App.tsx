import { AnimatePresence, MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import SiteCanvas from "./components/SiteCanvas";
import Features from "./pages/Features";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SystemCase from "./pages/SystemCase";

export default function App() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="never">
      <SiteCanvas />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/systems/:slug" element={<SystemCase />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}
