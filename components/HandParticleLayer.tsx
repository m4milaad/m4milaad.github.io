"use client";

import { useEffect, useRef, useState } from "react";
import "../styles/hand-particle-layer.css";
import { PARTICLE_WORD } from "@/constants/hero-words";
import HandCameraPermissionModal from "./HandCameraPermissionModal";

const MEDIAPIPE_HANDS_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands/";

const HAND_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

type Landmark = { x: number; y: number };
type HandLike = Landmark[];

const SMOOTH_FACTOR = 0.38;

function cloneHands(raw: HandLike[]): HandLike[] {
  return raw.map((h) => h.map((l) => ({ x: l.x, y: l.y })));
}

function smoothHands(prev: HandLike[], raw: HandLike[]): HandLike[] {
  if (raw.length === 0) return [];
  if (prev.length !== raw.length) return cloneHands(raw);
  return raw.map((hand, hi) => {
    const ph = prev[hi];
    if (!ph || ph.length !== hand.length) {
      return hand.map((l) => ({ x: l.x, y: l.y }));
    }
    return hand.map((l, i) => {
      const pl = ph[i];
      if (!pl) return { x: l.x, y: l.y };
      return {
        x: pl.x * (1 - SMOOTH_FACTOR) + l.x * SMOOTH_FACTOR,
        y: pl.y * (1 - SMOOTH_FACTOR) + l.y * SMOOTH_FACTOR,
      };
    });
  });
}

function loadHandsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { Hands?: unknown };
  if (w.Hands) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `${MEDIAPIPE_HANDS_BASE}hands.js`;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load MediaPipe Hands"));
    document.head.appendChild(s);
  });
}

type CameraGate = "ask" | "live" | "off";
const CAMERA_CONSENT_KEY = "milad-hand-tracking-consent";

export default function HandParticleLayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** Shared between canvas loop and MediaPipe (array of hands). */
  const handLandmarksRef = useRef<HandLike[]>([]);
  const smoothedHandsRef = useRef<HandLike[]>([]);

  /** `off` until client: avoids SSR/hydration mismatch; then ask or stay off if reduced motion. */
  const [cameraGate, setCameraGate] = useState<CameraGate>("off");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const savedConsent = window.localStorage.getItem(CAMERA_CONSENT_KEY);
    setCameraGate(savedConsent === "granted" ? "live" : "ask");
  }, []);

  const handleAllowCamera = () => {
    window.localStorage.setItem(CAMERA_CONSENT_KEY, "granted");
    setCameraGate("live");
  };

  const handleDismissCamera = () => {
    setCameraGate("off");
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!wrap || !canvas || !video) return;

    const rootEl = wrap;
    const canvasEl = canvas;
    const videoEl = video;

    const ctx = canvasEl.getContext("2d", { alpha: true });
    if (!ctx) return;
    const c2d: CanvasRenderingContext2D = ctx;
    c2d.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in c2d) {
      (
        c2d as CanvasRenderingContext2D & { imageSmoothingQuality: string }
      ).imageSmoothingQuality = "high";
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let W = 0;
    let H = 0;
    let t = 0;
    let lastToken = "";

    type Target = { x: number; y: number };
    let targetPoints: Target[] = [];
    const particles: Particle[] = [];

    class Particle {
      target: Target;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      noise: number;
      ns: number;
      hue: 0 | 1 | 2;

      constructor(target: Target) {
        this.target = target;
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 7;
        this.vy = (Math.random() - 0.5) * 7;
        this.size = 1.4 + Math.random() * 1.8;
        this.alpha = 0.55 + Math.random() * 0.45;
        this.noise = Math.random() * Math.PI * 2;
        this.ns = 0.01 + Math.random() * 0.014;
        this.hue = Math.random() < 0.55 ? 0 : Math.random() < 0.5 ? 1 : 2;
      }

      update(hands: HandLike[]) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.vx += dx * 0.055;
        this.vy += dy * 0.055;
        this.noise += this.ns;
        this.vx += Math.cos(this.noise) * 0.28;
        this.vy += Math.sin(this.noise) * 0.28;
        for (const hand of hands) {
          for (let i = 0; i < hand.length; i++) {
            const lm = hand[i];
            if (!lm) continue;
            const hx = (1 - lm.x) * W;
            const hy = lm.y * H;
            const ddx = this.x - hx;
            const ddy = this.y - hy;
            const d2 = ddx * ddx + ddy * ddy;
            const R = 150;
            if (d2 < R * R && d2 > 0) {
              const dist = Math.sqrt(d2);
              const f = ((R - dist) / R) * 16;
              this.vx += (ddx / dist) * f;
              this.vy += (ddy / dist) * f;
            }
          }
        }
        this.vx *= 0.87;
        this.vy *= 0.87;
        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(0, Math.min(W, this.x));
        this.y = Math.max(0, Math.min(H, this.y));
      }

      draw() {
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const fast = spd > 3.5;
        let r: number;
        let g: number;
        let b: number;
        /* Warm orange palette (original gesture demo) */
        if (this.hue === 0) {
          r = 148; g = 163; b = 184;
        } else if (this.hue === 1) {
          r = 100; g = 116; b = 139;
        } else {
          r = 203; g = 213; b = 225;
        }
        if (fast) {
          c2d.beginPath();
          c2d.moveTo(this.x - this.vx * 2.5, this.y - this.vy * 2.5);
          c2d.lineTo(this.x, this.y);
          c2d.strokeStyle = `rgba(${r},${g},${b},${Math.min(this.alpha * 0.45, 0.38)})`;
          c2d.lineWidth = this.size * 0.6;
          c2d.stroke();
        }
        c2d.beginPath();
        c2d.arc(this.x, this.y, this.size * (fast ? 1.4 : 1), 0, Math.PI * 2);
        c2d.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
        c2d.fill();
      }
    }

    function buildTargets(word: string) {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const oc = off.getContext("2d");
      if (!oc) return;
      const fs = Math.min(W * 0.26, H * 0.34, 260);
      oc.fillStyle = "#fff";
      oc.font = `900 ${fs}px "Orbitron","Arial Black",system-ui,sans-serif`;
      oc.textAlign = "center";
      oc.textBaseline = "middle";
      oc.fillText(word, W / 2, H / 2);
      const d = oc.getImageData(0, 0, W, H).data;
      const pts: Target[] = [];
      const step = Math.max(5, Math.floor(W / 220));
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (d[(y * W + x) * 4 + 3] > 100) pts.push({ x, y });
        }
      }
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }
      targetPoints = pts;
    }

    function rebuildParticles() {
      const count = Math.min(
        1800,
        Math.max(targetPoints.length || 600, 600),
      );
      while (particles.length > count) particles.pop();
      const fallback: Target = { x: W / 2, y: H / 2 };
      while (particles.length < count) {
        const tg =
          targetPoints[particles.length % targetPoints.length] ?? fallback;
        particles.push(new Particle(tg));
      }
      for (let i = 0; i < particles.length; i++) {
        const tg = targetPoints[i % targetPoints.length] ?? fallback;
        particles[i].target = tg;
      }
    }

    const amb = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0007,
      vy: (Math.random() - 0.5) * 0.0007,
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.07 + 0.02,
    }));

    function drawAmbient() {
      const dot = "148, 163, 184";
      for (const p of amb) {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        c2d.beginPath();
        c2d.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        c2d.fillStyle = `rgba(${dot},${p.a})`;
        c2d.fill();
      }
    }
    function drawHands(hands: HandLike[]) {
      for (const hand of hands) {
        c2d.lineWidth = 1;
        for (const [a, b] of HAND_LINKS) {
          const la = hand[a];
          const lb = hand[b];
          if (!la || !lb) continue;
          c2d.beginPath();
          c2d.moveTo((1 - la.x) * W, la.y * H);
          c2d.lineTo((1 - lb.x) * W, lb.y * H);
          c2d.strokeStyle = "rgba(148, 163, 184, 0.35)";
          c2d.stroke();
        }
        for (const idx of [0, 4, 8, 12, 16, 20]) {
          const lm = hand[idx];
          if (!lm) continue;
          const hx = (1 - lm.x) * W;
          const hy = lm.y * H;
          const r = idx === 0 ? 22 : 13;
          const pulse = 1 + 0.12 * Math.sin(t * 0.07 + idx * 0.9);
          c2d.beginPath();
          c2d.arc(hx, hy, r * pulse + 5, 0, Math.PI * 2);
          c2d.strokeStyle =
            idx === 0
              ? "rgba(203, 213, 225, 0.10)"
              : "rgba(148, 163, 184, 0.08)";
          c2d.lineWidth = 7;
          c2d.stroke();
          c2d.beginPath();
          c2d.arc(hx, hy, r * pulse, 0, Math.PI * 2);
          c2d.strokeStyle =
            idx === 0
              ? "rgba(226, 232, 240, 0.88)"
              : "rgba(148, 163, 184, 0.80)";
          c2d.lineWidth = 1.5;
          c2d.stroke();
          c2d.beginPath();
          c2d.arc(hx, hy, idx === 0 ? 5 : 3, 0, Math.PI * 2);
          c2d.fillStyle = idx === 0 ? "#CBD5E1" : "#94A3B8";
          c2d.fill();
        }
      }
    }

    function syncWordShapes() {
      const tok = PARTICLE_WORD;
      if (tok === lastToken && targetPoints.length) return;
      lastToken = tok;
      buildTargets(tok);
      rebuildParticles();
    }

    function resize() {
      const cssW = rootEl.clientWidth;
      const cssH = rootEl.clientHeight;
      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2.25,
      );
      canvasEl.width = Math.max(1, Math.floor(cssW * dpr));
      canvasEl.height = Math.max(1, Math.floor(cssH * dpr));
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = cssW;
      H = cssH;
      if (W < 4 || H < 4) return;
      syncWordShapes();
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(rootEl);
    resize();
    const onWinResize = () => resize();
    window.addEventListener("resize", onWinResize);

    let raf = 0;
    function frame() {
      t++;
      syncWordShapes();

      /* Let #MainDiv grid, vignette, mouse glow, and #Canvas3D show through */
      c2d.clearRect(0, 0, W, H);

      drawAmbient();

      const hands = reducedMotion ? [] : handLandmarksRef.current;
      for (const p of particles) {
        p.update(hands);
        p.draw();
      }
      if (!reducedMotion && hands.length > 0) drawHands(hands);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", onWinResize);
      cancelAnimationFrame(raf);
      ro.disconnect();
      handLandmarksRef.current = [];
      smoothedHandsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (cameraGate !== "live") return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let mpHands: {
      setOptions: (o: Record<string, unknown>) => void;
      onResults: (cb: (r: { multiHandLandmarks?: HandLike[] }) => void) => void;
      initialize: () => Promise<void>;
      send: (x: { image: HTMLVideoElement }) => Promise<void>;
      close?: () => void;
    } | null = null;
    let mpReady = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        const el = videoRef.current;
        if (!el) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        el.srcObject = stream;
        el.setAttribute("playsinline", "");
        el.muted = true;
        await el.play();
      } catch {
        /* denied or no device */
      }
    }

    async function initMp() {
      try {
        await loadHandsScript();
        const HandsCtor = (
          window as unknown as {
            Hands: new (o: {
              locateFile: (file: string) => string;
            }) => {
              setOptions: (o: Record<string, unknown>) => void;
              onResults: (
                cb: (r: { multiHandLandmarks?: HandLike[] }) => void,
              ) => void;
              initialize: () => Promise<void>;
              send: (x: { image: HTMLVideoElement }) => Promise<void>;
              close?: () => void;
            };
          }
        ).Hands;
        if (!HandsCtor || cancelled) return;
        const hands = new HandsCtor({
          locateFile: (file: string) => `${MEDIAPIPE_HANDS_BASE}${file}`,
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.72,
          minTrackingConfidence: 0.64,
        });
        hands.onResults((r: { multiHandLandmarks?: HandLike[] }) => {
          const raw = r.multiHandLandmarks ?? [];
          smoothedHandsRef.current = smoothHands(smoothedHandsRef.current, raw);
          handLandmarksRef.current = smoothedHandsRef.current;
        });
        await hands.initialize();
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        mpHands = hands;
        mpReady = true;

        const videoWithRvf = video as HTMLVideoElement & {
          requestVideoFrameCallback?: (
            cb: (now: number, meta: unknown) => void,
          ) => number;
        };
        const schedulePump = (fn: () => void) => {
          if (typeof videoWithRvf.requestVideoFrameCallback === "function") {
            void videoWithRvf.requestVideoFrameCallback(() => fn());
          } else {
            window.setTimeout(fn, 1000 / 30);
          }
        };

        const pumpFrame = async () => {
          if (cancelled || !mpReady || !mpHands) return;
          if (video.readyState < 2 || video.paused) {
            schedulePump(pumpFrame);
            return;
          }
          try {
            await mpHands.send({ image: video });
          } catch {
            /* frame drop */
          }
          schedulePump(pumpFrame);
        };
        schedulePump(pumpFrame);
      } catch {
        mpReady = false;
      }
    }

    void startCamera().then(() => {
      if (!cancelled) void initMp();
    });

    return () => {
      cancelled = true;
      handLandmarksRef.current = [];
      smoothedHandsRef.current = [];
      if (stream) {
        stream.getTracks().forEach((tr) => tr.stop());
        stream = null;
      }
      videoEl.srcObject = null;
      mpHands?.close?.();
      mpHands = null;
      mpReady = false;
    };
  }, [cameraGate]);

  return (
    <div
      id="HandParticleLayer"
      ref={wrapRef}
      aria-hidden={cameraGate === "ask" ? undefined : true}
    >
      <HandCameraPermissionModal
        open={cameraGate === "ask"}
        onAllow={handleAllowCamera}
        onDismiss={handleDismissCamera}
      />
      <video
        ref={videoRef}
        className="hp-webcam"
        autoPlay
        muted
        playsInline
      />
      <canvas ref={canvasRef} />
    </div>
  );
}
