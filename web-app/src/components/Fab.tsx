import type { ComponentPropsWithoutRef } from "react";
import type { MantineTheme, CSSObject } from "@mantine/styles";

import { Box, Button } from "@mantine/core";

export const FabBtn = Button;

const fabStyle = (theme: MantineTheme): CSSObject => ({
  position: "fixed",
  bottom: "2rem",
  right: "5rem",
  maxWidth: "100%",

  display: "flex",
  flexDirection: "column",

  "& button": {
    margin: "0.5rem",
    alignSelf: "center",
    flex: 1,
    borderRadius: "50%",
    background: theme.colors.gray[3],
    boxShadow: theme.shadows.xs,
    padding: theme.spacing.xs,
    ":hover": {
      backgroundColor: theme.colors.gray[5],
      boxShadow: theme.shadows.xl,
    },
  },

  "& > svg": {
    verticalAlign: "middle",
  },
});

export const Fab = (props: ComponentPropsWithoutRef<"div">) => (
  <Box {...props} sx={fabStyle} />
);
