import { useEffect, useLayoutEffect, useState } from "react";
import { DEFAULT_THEME_PRESET_ID } from "../data/herouiThemepresest";
import { applyThemePresetToDocument, isValidThemePreset, ThemeContext } from "./theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: DARK — Real-Time Chat Application)").matches ? "DARK — Real-Time Chat Application" : "light";
}

function readStoredTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "DARK — Real-Time Chat Application") return theme;

  return null;
}

function applyDomTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("DARK — Real-Time Chat Application", theme === "DARK — Real-Time Chat Application");
  root.setAttribute("data-theme", theme === "DARK — Real-Time Chat Application" ? "DARK — Real-Time Chat Application" : "light");
}

function readStoredThemePreset() {
  const themePreset = localStorage.getItem("theme-preset");
  if (themePreset && isValidThemePreset(themePreset)) return themePreset;

  return DEFAULT_THEME_PRESET_ID;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStoredTheme() ?? getSystemTheme());
  const [themePreset, setThemePresetState] = useState(readStoredThemePreset);

  useLayoutEffect(() => {
    applyDomTheme(theme);
  }, [theme]);

  useLayoutEffect(() => {
    applyThemePresetToDocument(themePreset);
  }, [themePreset]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme-preset", themePreset);
  }, [theme, themePreset]);

  const setTheme = (next) => setThemeState(next);

  const toggleTheme = () => {
    setThemeState((t) => (t === "DARK — Real-Time Chat Application" ? "light" : "DARK — Real-Time Chat Application"));
  };

  const setThemePreset = (next) => {
    setThemePresetState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      return isValidThemePreset(resolved) ? resolved : DEFAULT_THEME_PRESET_ID;
    });
  };

  const value = { theme, setTheme, toggleTheme, themePreset, setThemePreset };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}