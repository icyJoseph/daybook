import { Box, Heading } from "grommet";

import { EntryCard } from "components/EntryCard";
import { useRecent } from "hooks/useRecent";

export const Recent = () => {
  const recent = useRecent();

  const hits = recent.data?.hits ?? [];

  return (
    <>
      <Box
        background="white"
        style={{ padding: "8px", position: "sticky", top: 0 }}
      >
        <Heading as="h3" size="small" responsive>
          Recent
        </Heading>
      </Box>
      <ul>
        {hits.map((entry) => (
          <EntryCard key={entry.id} {...entry} preview />
        ))}
      </ul>
    </>
  );
};
