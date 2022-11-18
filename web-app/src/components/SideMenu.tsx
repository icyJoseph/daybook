import type { ReactNode } from "react";

import { Navbar } from "@mantine/core";

export const SideMenu = ({
  open,
  recent,
}: {
  open: boolean;
  recent: ReactNode;
}) => {
  return (
    <Navbar hiddenBreakpoint="sm" hidden={!open} width={{ sm: 320 }}>
      {recent}
    </Navbar>
  );
};
