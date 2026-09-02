import { AnimatePresence, MotionConfig } from "framer-motion";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import SiteCanvas from "./components/SiteCanvas";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Features = lazy(() => import("./pages/Features"));
const SystemCase = lazy(() => import("./pages/SystemCase"));

export default function App() {
  const location = useLocation();

  // "never" is deliberate: the site's motion is the product. Cost on weak
  // hardware is scaled by the device tier in lib/performance.ts, which is now
  // independent of the viewer's motion preference.
  return (
    <MotionConfig reducedMotion="never">
      <SiteCanvas />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route
            path="/features"
            element={
              <Suspense fallback={null}>
                <Features />
              </Suspense>
            }
          />
          <Route
            path="/systems/:slug"
            element={
              <Suspense fallback={null}>
                <SystemCase />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}
