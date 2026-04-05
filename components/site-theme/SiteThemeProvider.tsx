"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Ctx = { dark: boolean; toggleTheme: () => void };

const ThemeContext = createContext<Ctx>({
  dark: true,
  toggleTheme: () => {},
});

/** Site-wide theme (html class + context). Renders children only — no wrapper div. */
export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("milad-embed-theme");
    if (saved === "dark" || saved === "light") {
      setDark(saved === "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("milad-embed-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

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
