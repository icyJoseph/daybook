import { Button, ThemeType } from "grommet";
import styled from "styled-components";

export const Fab = styled(Button)`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  border-radius: 50%;
  padding: 0;
  background: ${({ theme }: { theme: ThemeType }) =>
    theme.global?.colors?.["light-3"]};
  box-shadow: ${({ theme }: { theme: ThemeType }) =>
    theme.global?.elevation?.light?.small};

  > svg {
    vertical-align: middle;
  }
`;
