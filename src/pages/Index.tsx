import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ClientReviews from "../components/ClientReviews";
import DeferredSection from "../components/DeferredSection";
import Explorations from "../components/Explorations";
import FeaturesCards from "../components/FeaturesCards";
import Hero from "../components/Hero";
import Journal from "../components/Journal";
import LoadingScreen from "../components/LoadingScreen";
import OpeningScroll from "../components/OpeningScroll";
import PageTransition from "../components/PageTransition";
import PortfolioGate from "../components/PortfolioGate";
import ScrollChapter from "../components/ScrollChapter";
import HeroParallaxDemo from "../components/hero-parallax-demo";
import SmoothScroll from "../components/SmoothScroll";
import FeyCards from "../components/ui/fey-cards";
import FloatingDockDemo from "../components/floating-dock-demo";
import { AuroraBackground } from "../components/ui/aurora-background";
import { getAssetReadiness } from "../lib/critical-assets";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const readiness = useMemo(() => getAssetReadiness(), []);

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <>
      <FloatingDockDemo />
      <SmoothScroll enabled={!isLoading} />
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen
            readiness={readiness}
            onComplete={() => setIsLoading(false)}
          />
        )}
      </AnimatePresence>
      <PageTransition>
        <main className="relative z-10">
          <div className="relative isolate">
            <OpeningScroll>
              <Hero active={!isLoading} />
              <PortfolioGate />
            </OpeningScroll>
          </div>
          <div className="fixed inset-0 z-[-1]">
            <AuroraBackground className="h-full w-full" />
          </div>
          <div className="relative isolate bg-transparent">
            <ScrollChapter overlap overlapSpan={72} z={12} pin={false}>
              <HeroParallaxDemo />
            </ScrollChapter>
            <Journal />
            <DeferredSection delay={220} waitUntilBelow="work">
              <div className="relative bg-black perf-section">
                <Explorations />
              </div>
            </DeferredSection>
            <DeferredSection delay={320} waitUntilBelow="work">
              <div className="relative bg-black perf-section">
                <FeaturesCards />
              </div>
            </DeferredSection>
            <DeferredSection delay={420} waitUntilBelow="work">
              <div className="relative bg-black perf-section">
                <ClientReviews />
              </div>
            </DeferredSection>
            <DeferredSection delay={520} waitUntilBelow="work">
              <div className="relative bg-black perf-section">
                <FeyCards />
              </div>
            </DeferredSection>
          </div>
        </main>
      </PageTransition>
    </>
  );
}
