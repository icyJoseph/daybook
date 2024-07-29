import { Global } from "@mantine/core";

export const GlobalStyle = () => (
  <Global
    styles={() => ({
      "html,  body,  body > #__next": {
        height: "100%",
      },
    })}
  />
);
