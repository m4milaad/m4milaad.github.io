"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Ctx = { dark: boolean; toggleTheme: () => void };

const ThemeContext = createContext<Ctx>({
  dark: false,
  toggleTheme: () => {},
});

const listeners = new Set<() => void>();

function emitThemeChange() {
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onChange);
  }
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onChange);
    }
  };
}

function getServerSnapshot() {
  return false;
}

function getClientSnapshot() {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem("milad-embed-theme");
    return saved === "dark";
  } catch {
    return false;
  }
}

/** Site-wide theme (html class + context). Renders children only — no wrapper div. */
export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const dark = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const toggleTheme = useCallback(() => {
    try {
      const saved = localStorage.getItem("milad-embed-theme");
      const currentlyDark = saved === "dark";
      localStorage.setItem(
        "milad-embed-theme",
        currentlyDark ? "light" : "dark",
      );
      const apply = () => {
        // Flip the class here, not in the effect, so the view transition captures the new theme
        document.documentElement.classList.toggle("embed-site-light", currentlyDark);
        emitThemeChange();
      };
      if (
        document.startViewTransition &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("embed-site-light", !dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSiteTheme() {
  return useContext(ThemeContext);
}
