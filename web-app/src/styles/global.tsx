import type { MantineTheme } from "@mantine/styles";
import { Global } from "@mantine/core";
import { CSSProperties } from "react";

const scrollbars = (theme: MantineTheme) => ({
  /* Works on Firefox */
  "*": {
    scrollbarWidth: "thin" as CSSProperties["scrollbarWidth"],
    scrollbarColor: `${theme.colors.gray[2]} ${theme.colors.gray[5]}`
  },
  /* Works on Chrome, Edge, and Safari */
  "*::-webkit-scrollbar ": {
    width: "12px"
  },

  "*::-webkit-scrollbar-track": {
    background: theme.colors.gray[2]
  },

  "*::-webkit-scrollbar-thumb": {
    backgroundColor: theme.colors.gray[5],
    borderRadius: "20px",
    border: `3px solid ${theme.colors.gray[5]}`
  }
});

export const GlobalStyle = () => (
  <Global
    styles={(theme) => ({
      "html,  body,  body > #__next": {
        height: "100%"
      },
      ...scrollbars(theme)
    })}
  />
);
