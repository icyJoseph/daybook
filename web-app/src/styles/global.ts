import { createGlobalStyle, css } from "styled-components";
import type { ThemeType } from "grommet";

import { reset } from "styles/reset";
import { normalize } from "styles/normalize";
import { npStyle } from "styles/nprogress";

const base = css`
  html,
  body,
  body > #__next {
    height: 100%;
  }
`;

const scrollbars = css<{ theme: ThemeType }>`
  /* Works on Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) =>
      `${theme.global?.colors["light-4"]} ${theme.global?.colors["light-1"]}`};
  }

  /* Works on Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 12px;
  }

  *::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.global?.colors["light-1"]};
  }

  *::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.global?.colors["light-4"]};
    border-radius: 20px;
    border: ${({ theme }) => `3px solid ${theme.global?.colors["light-1"]}`};
  }
`;

export const GlobalStyle = createGlobalStyle`
${normalize};
${reset};
${base};
${scrollbars};
${npStyle}
`;
