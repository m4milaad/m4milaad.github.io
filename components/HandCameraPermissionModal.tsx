"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/hand-camera-permission-modal.css";

type Props = {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
};

/**
 * Renders via portal to document.body so it stacks above #RightPanel / #LeftPanel
 * (z-index 101+). The hand particle layer stays at z-index 11 for pass-through.
 */
export default function HandCameraPermissionModal({
  open,
  onAllow,
  onDismiss,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mounted, onDismiss]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="hp-cam-perm-root" data-open={open ? "" : undefined}>
      <div
        className="hp-cam-perm-dialog"
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="hp-cam-perm-accent" aria-hidden />

        <div className="hp-cam-perm-header">
          <div className="hp-cam-perm-icon" aria-hidden>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="6.5" width="14" height="11" rx="3.2" />
              <path d="M17 10l4-2.3v8.6L17 14z" />
              <circle cx="10" cy="12" r="3" />
              <circle cx="10" cy="12" r="1.25" />
              <path d="M7.1 6.5l1.2-2h3.4l1.2 2" />
            </svg>
          </div>
          <h2 id={titleId} className="hp-cam-perm-title">
            Use camera for hand tracking?
          </h2>
        </div>

        {/* demo video preview */}
        <div className="hp-cam-perm-video-wrap" aria-hidden>
          <video
            className="hp-cam-perm-video"
            src="/demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
          />
          <div className="hp-cam-perm-video-vignette" />
        </div>

        <p id={descId} className="hp-cam-perm-body">
          Use <strong>local camera-only processing</strong> to move particles with
          your hands.
          <span className="hp-cam-perm-note">
            Not recorded. Not uploaded. Nothing shown on screen.
          </span>
        </p>

        <div className="hp-cam-perm-actions">
          <button
            type="button"
            className="hp-cam-perm-btn hp-cam-perm-btn-primary"
            onClick={onAllow}
          >
            Allow camera
          </button>
          <button
            type="button"
            className="hp-cam-perm-btn hp-cam-perm-btn-secondary"
            onClick={onDismiss}
          >
            Not now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}