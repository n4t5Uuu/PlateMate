"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { AuthMode } from "./auth-form";
import { useAuthStage } from "./auth-stage";

const switchingPaneClasses = "auth-pane auth-pane-enter";
const restingPaneClasses = "auth-pane";
const leavingPaneClasses = "auth-pane auth-pane-exit";

export function AuthPane({
  mode,
  children,
  leaving = children,
}: {
  mode: AuthMode;
  children: ReactNode;
  // what the sheet fades out when switching away from this pane (default: the pane itself)
  leaving?: ReactNode;
}) {
  const { leavingPane, hasSwitched, registerCurrentPane, clearLeavingPane } =
    useAuthStage();

  const paneRef = useRef<HTMLDivElement>(null);

  // Next keeps the previous route mounted but hidden; drop the marker then, so the stage's
  // :has() rules only ever see the visible pane.
  useLayoutEffect(() => {
    const pane = paneRef.current;
    pane?.setAttribute("data-auth-mode", mode);
    registerCurrentPane({ mode, node: leaving });
    return () => pane?.removeAttribute("data-auth-mode");
  }, [registerCurrentPane, mode, leaving]);

  return (
    <div className="grid">
      <div
        ref={paneRef}
        className={hasSwitched ? switchingPaneClasses : restingPaneClasses}
        data-auth-mode={mode}
      >
        {children}
      </div>
      {leavingPane && (
        <div
          key={leavingPane.mode}
          className={leavingPaneClasses}
          inert
          onAnimationEnd={clearLeavingPane}
        >
          {leavingPane.node}
        </div>
      )}
    </div>
  );
}
