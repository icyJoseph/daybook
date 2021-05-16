import styled from "styled-components";
import { Box, BoxExtendedProps, Heading } from "grommet";

import { EntryCard } from "components/EntryCard";
import { useRecent } from "hooks/useRecent";

const StickyBox = styled(Box)<BoxExtendedProps>`
  position: sticky;
  top: 0;
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.global?.elevation?.light?.small};
`;

export const Recent = ({ days = 7 }) => {
  const recent = useRecent(days);

  const hits = recent.data?.hits ?? [];

  return (
    <>
      <StickyBox background="white">
        <Heading as="h3" size="small" responsive>
          Recent
        </Heading>
      </StickyBox>
      <ul>
        {hits.map((entry) => (
          <EntryCard key={entry.id} {...entry} preview />
        ))}
      </ul>
    </>
  );
};
