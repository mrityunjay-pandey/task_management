// Matches the Theme and ColorMode enums in the backend's Prisma schema.
export type ThemeMode = "light" | "dark";
export type ColorMode = "amber" | "blue" | "pink" | "rose" | "emerald" | "black";

export const COLOR_MODES: ColorMode[] = [
  "amber",
  "blue",
  "pink",
  "rose",
  "emerald",
  "black",
];

// next-themes stores one combined string, e.g. "dark-emerald".
// These two helpers convert between that string and our two separate values,
// since the Figma design shows Theme and Color Mode as two independent menus.
export function combineTheme(mode: ThemeMode, color: ColorMode): string {
  return `${mode}-${color}`;
}

export function splitTheme(combined: string | undefined): {
  mode: ThemeMode;
  color: ColorMode;
} {
  const [mode, color] = (combined ?? "light-black").split("-") as [
    ThemeMode,
    ColorMode,
  ];
  return { mode: mode ?? "light", color: color ?? "black" };
}
