import { ThemeType } from "grommet";
import styled, { css } from "styled-components";

export const Grid = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;

  display: grid;
  height: 100%;
  grid-template-columns: auto 1fr;
  grid-template-areas: "g-menu g-workspace";
`;

const asideAnim = css`
  transform: translateX(calc(-100%));
`;

export const GridWorkspace = styled.section`
  grid-area: g-workspace;
  display: grid;
  grid-template-areas: "g-side g-main";

  grid-template-columns: 1fr;

  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;

  @media (min-width: 1024px) {
    grid-template-columns: 414px 1fr;
  }
`;

type GridAsideProps = {
  sideBarOpen: boolean;
  theme: ThemeType;
};

export const GridAside = styled.aside<GridAsideProps>`
  position: absolute;
  overflow-y: scroll;
  transition: all 0.5s;
  grid-column: span 2;
  ${(props) => !props.sideBarOpen && asideAnim};
  z-index: 10;
  height: 100%;
  width: 100%;

  background: rgba(0, 0, 0, 0.5);

  @media (min-width: 1024px) {
    height: unset;
    width: unset;
    position: initial;
    transform: unset;
    grid-column: unset;
    background-color: unset;
    grid-area: g-side;
  }
`;

type GridMainProps = { sideBarOpen: boolean };

export const GridMain = styled.main<GridMainProps>`
  overflow-y: auto;
  grid-column: span 2;
  transition: all 0.5s;

  @media (min-width: 1024px) {
    transform: unset;
    grid-column: unset;
    grid-area: g-main;
  }
`;
