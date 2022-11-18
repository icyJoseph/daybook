import { Box, Button, List, Navbar, ScrollArea, Title } from "@mantine/core";

import { EntryCard } from "components/EntryCard";
import { Close } from "grommet-icons";
import { useRecent } from "hooks/useRecent";

export const Recent = ({ onClose }: { onClose: () => void }) => {
  const { data, hasNextPage, fetchNextPage, isFetched } = useRecent();

  const hits = data?.pages.flatMap((page) => page.hits) ?? [];

  return (
    <>
      <Navbar.Section>
        <Box
          p="md"
          sx={(theme) => ({
            position: "sticky",
            top: 0,
            isolation: "isolate",
            zIndex: 1,
            background: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: theme.shadows.sm,
          })}
        >
          <Title order={3} sx={{ fontSize: "2rem", fontWeight: 300 }}>
            Recent
          </Title>

          <Button
            variant="subtle"
            sx={{
              display: "block",
              "@media (min-width: 769px)": {
                display: "none",
              },
            }}
          >
            <Close onClick={onClose} />
          </Button>
        </Box>
      </Navbar.Section>

      <Navbar.Section grow component={ScrollArea} px="md">
        <List spacing="xl" my="xl">
          {hits.map((entry) => (
            <EntryCard key={entry.id} {...entry} />
          ))}
        </List>

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
      </Navbar.Section>
    </>
  );
};
