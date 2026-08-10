"use client";

import { useTheme } from "next-themes";
import type { ThemeMode, ColorMode } from "@/types/theme";
import { combineTheme, splitTheme } from "@/types/theme";

// The Figma design shows Theme (Light/Dark) and Color Mode (6 swatches) as
// two separate menus, but next-themes only tracks one combined string.
// This hook is the adapter: components read/set `mode` and `color`
// independently, and this hook recombines them under the hood.
export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { mode, color } = splitTheme(theme ?? resolvedTheme);

  function setMode(nextMode: ThemeMode) {
    setTheme(combineTheme(nextMode, color));
  }

  function setColor(nextColor: ColorMode) {
    setTheme(combineTheme(mode, nextColor));
  }

  return { mode, color, setMode, setColor };
}
