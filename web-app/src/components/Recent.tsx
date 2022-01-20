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

const LoadMore = styled(Button)`
  margin: 1rem auto;
`;

export const Recent = ({ docked = false, close = () => {} }) => {
  const { data, hasNextPage, fetchNextPage, isFetched } = useRecent();

  const hits = data?.pages.flatMap((page) => page.hits) ?? [];

  return (
    <>
      <StickyBox
        background="white"
        direction="row"
        align="center"
        justify="between"
      >
        <Heading as="h3" size="small" responsive>
          Recent
        </Heading>

        <Button
          hidden={docked}
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

      <Box>
        {isFetched && (
          <LoadMore
            primary
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage}
            label="More"
          />
        )}
      </Box>
    </>
  );
};
