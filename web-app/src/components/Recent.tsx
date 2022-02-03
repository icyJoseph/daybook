import type { MouseEvent } from "react";

import { Box, Button, Title } from "@mantine/core";

import { EntryCard } from "components/EntryCard";
import { useRecent } from "hooks/useRecent";
import { Close } from "grommet-icons";

export const Recent = ({ docked = false, close = () => {} }) => {
  const { data, hasNextPage, fetchNextPage, isFetched } = useRecent();

  const hits = data?.pages.flatMap((page) => page.hits) ?? [];

  return (
    <>
      <Box
        sx={(theme) => ({
          position: "sticky",
          top: 0,
          padding: "0.5rem",
          isolation: "isolate",
          zIndex: 1,
          background: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: theme.shadows.sm,
          "& ~ ul": {
            padding: "0 8px"
          }
        })}
      >
        <Title order={3} sx={{ fontSize: "2rem", fontWeight: 300 }}>
          Recent
        </Title>

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
      </Box>

      <ul>
        {hits.map((entry) => (
          <EntryCard key={entry.id} {...entry} preview />
        ))}
      </ul>

      <Box sx={{ textAlign: "center" }}>
        {isFetched && (
          <Button
            my="lg"
            mx="sm"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage}
          >
            More
          </Button>
        )}
      </Box>
    </>
  );
};
