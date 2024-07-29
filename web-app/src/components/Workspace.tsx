import type { ReactNode } from "react";

import { PollingUpdates } from "hooks/usePollingUpdates";

export const Workspace = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <PollingUpdates />

      <>{children}</>
    </>
  );
};
