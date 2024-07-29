import { type ReactNode } from "react";
import { Box } from "@mantine/core";

export const Aside = ({ children }: { children: ReactNode | ReactNode[] }) => (
  <Box
    component="aside"
    sx={(theme) => ({
      display: "grid",
      gridTemplateRows: "5rem 1fr 1fr",
      backgroundColor: theme.colors.gray[9],
      flexBasis: "3rem",
    })}
  >
    {children}
  </Box>
);
