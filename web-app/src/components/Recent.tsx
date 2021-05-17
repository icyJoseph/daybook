import styled from "styled-components";
import { Box, BoxExtendedProps, Button, Heading } from "grommet";

import { EntryCard } from "components/EntryCard";
import { useRecent } from "hooks/useRecent";
import { Close } from "grommet-icons";

const StickyBox = styled(Box)<BoxExtendedProps>`
  position: sticky;
  top: 0;
  padding: 0.5rem;
  box-shadow: ${({ theme }) => theme.global?.elevation?.light?.small};
`;

export const Recent = ({ days = 7, label = "week", close = () => {} }) => {
  const recent = useRecent(days);

  const hits = recent.data?.hits ?? [];

  return (
    <>
      <StickyBox
        background="white"
        direction="row"
        align="center"
        justify="between"
      >
        <Heading as="h3" size="small" responsive>
          Recent {label}
        </Heading>

        <Button
          icon={<Close />}
          onClick={(e) => {
            close();
            e.currentTarget.blur();
          }}
        ></Button>
      </StickyBox>
      <ul>
        {hits.map((entry) => (
          <EntryCard key={entry.id} {...entry} preview />
        ))}
      </ul>
    </>
  );
};
