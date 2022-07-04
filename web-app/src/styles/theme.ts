import type { ThemeType } from "grommet";
import { css } from "styled-components";

export const theme: ThemeType = {
  global: {
    font: {
      family: "Fira Sans",
      size: "18px",
      height: "20px",
    },
    colors: {
      brand: "#E84855",
      "accent-1": "#C0E8F9",
      "accent-2": "#EFBCD5",
      "accent-3": "#87F5FB",
      "accent-4": "#F9DC5C",
      "neutral-1": "#62BBC1",
      "neutral-2": "#403F4C",
      "neutral-3": "#3185FC",
      "neutral-4": "#D9726C",
    },
  },
  heading: {
    color: "neutral-2",
    weight: 200,
  },
  grommet: {
    extend() {
      return css`
        display: flex;
        height: 100%;
        flex-flow: column;
      `;
    },
  },
};
