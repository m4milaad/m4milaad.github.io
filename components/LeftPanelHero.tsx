"use client";

import "../styles/left-panel-hero.css";
import { useSiteTheme } from "./site-theme/SiteThemeProvider";

const LINKS = [
  ["Email", "mailto:mb4milad.bhattt@gmail.com"],
  ["GitHub", "https://github.com/m4milaad"],
  ["LinkedIn", "https://www.linkedin.com/in/m4milaad/"],
  ["X", "https://x.com/m4milaad"],
  ["Résumé", "/Images/Milad%20Ajaz%20Bhat%20Resume.pdf"],
] as const;

export default function LeftPanelHero() {
  const { dark, toggleTheme } = useSiteTheme();
  return (
    <header>
      <div className="masthead">
        <a className="signature" href="#MainDiv" aria-label="Milad Ajaz Bhat, home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Images/dev-head.png" width="32" height="32" alt="" />
          m4milaad
        </a>
        <nav aria-label="Portfolio">
          <a href="#Section2">Work</a>
          <a href="#Section3">Experience</a>
          <button id="OpenTerminal" type="button" aria-label="Open terminal"><span aria-hidden="true">›<span className="cursor">_</span></span> Terminal</button>
          <button className="theme-toggle" type="button"
            onClick={(e) => {
              // The new theme spreads out from the centre of this button
              const r = e.currentTarget.getBoundingClientRect();
              const s = document.documentElement.style;
              s.setProperty("--vt-x", `${r.left + r.width / 2}px`);
              s.setProperty("--vt-y", `${r.top + r.height / 2}px`);
              toggleTheme();
            }}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            title={dark ? "Switch to light theme" : "Switch to dark theme"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" />
            </svg>
          </button>
        </nav>
      </div>

      <div className="intro">
        <p className="availability"><span aria-hidden="true" />Available for work</p>
        <h1>
          <span className="word"><span>Milad</span></span>{" "}
          <span className="word"><i>Ajaz</i></span>{" "}
          <span className="word"><span>Bhat</span></span>
        </h1>
        <p className="bio">I build software, web apps, and machine learning models. I study computer science at the Central University of Kashmir.</p>
        <ul className="contact-links" aria-label="Contact and profiles">
          {LINKS.map(([label, href]) => (
            <li key={href}><a href={href} {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{label}</a></li>
          ))}
        </ul>
      </div>
    </header>
  );
}
