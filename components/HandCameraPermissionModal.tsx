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
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l2.5 3h5L21 15V9l-6.5-5Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h2 id={titleId} className="hp-cam-perm-title">
            Use camera for hand tracking?
          </h2>
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
