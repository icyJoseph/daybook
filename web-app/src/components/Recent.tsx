import { useState, useEffect } from "react";
import { Box, Heading } from "grommet";

import { EntryCard } from "components/EntryCard";
import { useConstant } from "hooks/useConstant";
import { Entry } from "interfaces/entry";

export const Recent = () => {
  const [entries, setEntries] = useState<Entry[]>([]);

  const date = useConstant(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return Math.floor(date.getTime() / 1000);
  });

  useEffect(() => {
    fetch(`/api/search/later_than?created_at=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if ("hits" in data) {
          setEntries(data.hits);
        } else {
          setEntries([]);
        }
      })
      .catch(() => {
        setEntries([]);
      });
  }, [date]);

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
        {entries.map((entry) => (
          <EntryCard key={entry.id} {...entry} preview />
        ))}
      </ul>
    </>
  );
};
