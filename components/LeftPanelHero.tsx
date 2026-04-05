"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import "../styles/left-panel-hero.css";
import { useSiteTheme } from "./site-theme/SiteThemeProvider";

const SunIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    aria-hidden
  >
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
  </svg>
);

const MoonIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
      clipRule="evenodd"
    />
  </svg>
);

function IconGithub() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" className="lp-social-svg" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" className="lp-social-svg" aria-hidden>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function IconGmail() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" className="lp-social-svg" aria-hidden>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" className="lp-social-svg" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconCv() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
        clipRule="evenodd"
      />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

const ROTATING_WORDS = ["Products", "Interfaces", "Experiences"] as const;

export default function LeftPanelHero() {
  const { dark, toggleTheme } = useSiteTheme();
  const [clock, setClock] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    const update = () => {
      setClock(
        new Date().toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordVisible(false);
      window.setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setWordVisible(true);
      }, 400);
    }, 2500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="lp-hero">
      <div className={`lp-card${dark ? " lp-card-dark" : ""}`}>
        <div className="lp-card-top">
          <div className="lp-card-id-row">
            <div className="lp-avatar-wrap">
              <img
                className="lp-avatar"
                src="/Images/devWalking.gif"
                alt="Milad Ajaz Bhat"
                width={72}
                height={72}
                onError={(e) => {
                  const el = e.currentTarget;
                  const s = el.src;
                  if (s.includes("devWalking.gif")) {
                    el.src = "/Images/dev.png";
                  } else if (s.includes("dev.png")) {
                    el.src = "/Images/logo.png";
                  }
                }}
              />
            </div>
            <div className="lp-id-block">
              <h1 className="lp-name">
                <span className="lp-name-inner">Milad Ajaz Bhat.</span>
              </h1>
              <p className="lp-handle">@m4milaad</p>
            </div>
          </div>
          <button
            type="button"
            className="lp-theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="lp-tagline-block">
          <h2 className="lp-headline">
            I build{" "}
            <em
              className="lp-rotating-word"
              data-visible={wordVisible ? "true" : "false"}
            >
              {ROTATING_WORDS[wordIndex]}
            </em>
            .
          </h2>
          <p className="lp-bio">
            With active engagement in programming and a diverse portfolio of
            self-initiated projects.
          </p>
        </div>

        <div className="lp-social-row">
          <a
            className="lp-social-btn lp-social-neutral"
            href="https://github.com/m4milaad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <IconGithub />
          </a>
          <a
            className="lp-social-btn lp-social-neutral"
            href="https://x.com/m4milaad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
          >
            <IconX />
          </a>
          <a
            className="lp-social-btn lp-social-gmail"
            href="mailto:mb4milad.bhattt@gmail.com"
            aria-label="Email"
          >
            <IconGmail />
          </a>
          <a
            className="lp-social-btn lp-social-linkedin"
            href="https://www.linkedin.com/in/m4milaad/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <IconLinkedIn />
          </a>
        </div>

        <div className="lp-bottom-row">
          <a
            className="lp-cv"
            href="/Images/Milad%20Ajaz%20Bhat%20Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconCv />
            View CV
          </a>
          <div className="lp-footer-meta">
            <span className="lp-time">{clock}</span>
            <div className="lp-available">
              <span className="lp-available-dot" aria-hidden />
              Available for work
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
