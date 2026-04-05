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
  dark: true,
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
  return true;
}

function getClientSnapshot() {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem("milad-embed-theme");
    return saved !== "light";
  } catch {
    return true;
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
      const currentlyDark = saved !== "light";
      localStorage.setItem(
        "milad-embed-theme",
        currentlyDark ? "light" : "dark",
      );
      emitThemeChange();
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
