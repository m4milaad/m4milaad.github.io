import HandParticleLayer from "@/components/HandParticleLayer";
import { SiteThemeProvider } from "@/components/site-theme/SiteThemeProvider";

/**
 * Temporary recording route:
 * keep only background shell + hand particle layer.
 * Remove this file when recording is finished.
 */
export default function HandTrackingTestPage() {
  return (
    <SiteThemeProvider>
      <canvas id="Canvas3D" />
      <div id="MainDiv">
        <div id="MouseGlow" />
        <div id="MouseGlowBlur" />
        <HandParticleLayer />
      </div>
    </SiteThemeProvider>
  );
}
