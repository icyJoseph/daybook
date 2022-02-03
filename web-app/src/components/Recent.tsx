import type { MouseEvent } from "react";

import styled from "styled-components";
import { Box, BoxExtendedProps, Heading } from "grommet";
import { Button } from "@mantine/core";

import { EntryCard } from "components/EntryCard";
import { useRecent } from "hooks/useRecent";
import { Close } from "grommet-icons";

const StickyBox = styled(Box)<BoxExtendedProps>`
  position: sticky;
  top: 0;
  padding: 0.5rem;
  box-shadow: ${({ theme }) => theme.global?.elevation?.light?.small};
  isolation: isolate;
  z-index: 1;

  & ~ ul {
    padding-right: 8px;
    padding-left: 8px;
  }
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
          variant="subtle"
          hidden={docked}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            close();
            e.currentTarget.blur();
          }}
        >
          <Close />
        </Button>
      </StickyBox>

      <ul>
        {hits.map((entry) => (
          <EntryCard key={entry.id} {...entry} preview />
        ))}
      </ul>

      <Box>
        {isFetched && (
          <LoadMore onClick={() => fetchNextPage()} disabled={!hasNextPage}>
            More
          </LoadMore>
        )}
      </Box>
    </>
  );
};
