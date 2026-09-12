import { createContext, useContext } from "react";
import {
  DEFAULT_THEME_PRESET_ID,
  HERO_UI_THEME_PRESETS,
} from "../data/herouiThemepresest";

export const ThemeContext = createContext(null);


const safePresets = Array.isArray(HERO_UI_THEME_PRESETS)
  ? HERO_UI_THEME_PRESETS
  : [];
const PRESET_IDS = new Set(safePresets.map((p) => p.id));

export function isValidThemePreset(presetId) {
  return PRESET_IDS.has(presetId);
}

export function applyThemePresetToDocument(presetId) {
  const id = isValidThemePreset(presetId) ? presetId : DEFAULT_THEME_PRESET_ID;
  document.documentElement.setAttribute("data-theme-preset", id);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
