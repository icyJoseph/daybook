import {
  Box,
  BoxExtendedProps,
  Button,
  ButtonExtendedProps,
  ThemeType
} from "grommet";
import styled from "styled-components";

export const FabBtn = styled(Button)<ButtonExtendedProps>``;

export const Fab = styled(Box)<BoxExtendedProps>`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  display: flex;

  & ${FabBtn} {
    margin: 0.5rem;
    align-self: center;
    flex: 1;
    border-radius: 50%;
    background: ${({ theme }: { theme: ThemeType }) =>
      theme.global?.colors?.["light-3"]};
    box-shadow: ${({ theme }: { theme: ThemeType }) =>
      theme.global?.elevation?.light?.small};

    > svg {
      vertical-align: middle;
    }
  }
`;
