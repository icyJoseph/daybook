import { ThemeType } from "grommet";
import styled, { css } from "styled-components";

export const Grid = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: auto 1fr;
  grid-template-rows: 4rem 1fr;
  row-gap: 1rem;
  grid-template-areas:
    "g-menu g-header "
    "g-menu g-workspace ";
`;

export const GridHeader = styled.header`
  grid-area: g-header;
  display: grid;
  grid-template-columns: max-content 1fr;
`;

const asideAnim = css`
  transform: translateX(calc(-100%));
`;

export const GridWorkspace = styled.section`
  grid-area: g-workspace;
  display: grid;
  grid-template-areas: "g-side g-main";
  grid-template-columns: minmax(250px, 1fr) 4fr;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
`;

export const GridAside = styled.aside<{ open: boolean; theme: ThemeType }>`
  position: absolute;
  overflow-y: scroll;
  transition: all 0.5s;
  grid-column: span 2;
  ${(props) => !props.open && asideAnim};
  z-index: 10;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);

  @media (min-width: 620px) {
    height: unset;
    width: unset;
    position: initial;
    transform: unset;
    grid-column: unset;
    background-color: unset;

    grid-area: g-side;
  }
`;

export const GridMain = styled.main<{ open: boolean }>`
  padding: 0 12px 12px;
  overflow-y: auto;
  grid-column: span 2;
  transition: all 0.5s;

  @media (min-width: 620px) {
    transform: unset;
    grid-column: unset;
    grid-area: g-main;
  }

  > ul {
    max-width: 45ch;
    margin: 0 auto;
  }
`;
