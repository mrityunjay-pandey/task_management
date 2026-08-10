import type { ThemeMode, ColorMode } from "./theme";

export interface User {
  id: string;
  guestName: string;
  email: string | null;
  title: string | null;
  username: string | null;
  theme: Uppercase<ThemeMode>;
  colorMode: Uppercase<ColorMode>;
}
