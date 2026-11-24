"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthMode } from "./auth-form";

export type Pane = { mode: AuthMode; node: ReactNode };

type AuthStageValue = {
  leavingPane: Pane | null;
  hasSwitched: boolean;
  registerCurrentPane: (pane: Pane) => void;
  clearLeavingPane: () => void;
};

const AuthStageContext = createContext<AuthStageValue | null>(null);

export function useAuthStage() {
  const stage = useContext(AuthStageContext);
  if (!stage) throw new Error("useAuthStage must be used inside AuthStage");
  return stage;
}

const stageClasses =
  "auth-stage relative grid min-h-dvh items-center overflow-clip pb-8 pt-[26vw] md:py-8";
const sheetClasses =
  "auth-sheet relative z-10 mx-4 w-auto max-w-[520px] rounded-[22px] border border-foreground bg-background px-6 py-7 md:mx-0 md:w-[520px] md:px-11 md:py-9";
const wordmarkClasses = "text-xl font-extrabold tracking-tight";

export function AuthStage({ children }: { children: ReactNode }) {
  const [leavingPane, setLeavingPane] = useState<Pane | null>(null);
  const [hasSwitched, setHasSwitched] = useState(false);
  const currentPane = useRef<Pane | null>(null);

  const registerCurrentPane = useCallback((pane: Pane) => {
    const previous = currentPane.current;
    currentPane.current = pane;
    if (previous && previous.mode !== pane.mode) {
      setHasSwitched(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        setLeavingPane(previous);
    }
  }, []);
  const clearLeavingPane = useCallback(() => setLeavingPane(null), []);
  const stage = useMemo(
    () => ({ leavingPane, hasSwitched, registerCurrentPane, clearLeavingPane }),
    [leavingPane, hasSwitched, registerCurrentPane, clearLeavingPane],
  );

  return (
    <AuthStageContext value={stage}>
      <div className={stageClasses}>
        <div aria-hidden className="auth-plane auth-plane-blue" />
        <div aria-hidden className="auth-plane auth-plane-red" />
        <div aria-hidden className="auth-plane auth-plane-yellow" />
        <main className={sheetClasses}>
          <span className={wordmarkClasses}>PlateMate</span>
          {children}
        </main>
      </div>
    </AuthStageContext>
  );
}
