import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { getAssetReadiness } from "./lib/critical-assets";
import { applyEffectQualityToDocument } from "./lib/performance";
import { ThemeProvider } from "./lib/theme";
import "./lib/gsap-config";
import "./index.css";

getAssetReadiness().start();
applyEffectQualityToDocument();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
