import { createContext, useMemo, type ReactNode } from "react";

const ThemeContext = createContext({ dark: false });

export function BadProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={{ dark: true }}>{children}</ThemeContext.Provider>;
}

export function GoodProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ dark: true }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function NotAProvider() {
  return <input value={{ toString: () => "x" } as unknown as string} readOnly />;
}
