import Link from "next/link";
import { Box, Button, ListItem, Text, Title } from "@mantine/core";
import type { Entry } from "interfaces/entry";

export const EntryCard = ({
  id,
  title,
  created_at,
}: Entry & { preview?: boolean }) => {
  const date = new Date(created_at * 1000).toLocaleDateString();

  return (
    <ListItem
      py="sm"
      sx={(theme) => ({
        backgroundColor: theme.colors.gray[0],
        "&:hover": {
          backgroundColor: theme.colors.gray[1],
        },
      })}
    >
      <Box p="md">
        <Title
          order={2}
          align="left"
          sx={{ fontSize: "1.5rem", fontWeight: 300 }}
        >
          {title}
        </Title>

        <Text component="p">
          <time dateTime={date}>{date}</time>
        </Text>
      </Box>

      <Box mt="sm" sx={{ display: "flex", gap: "1rem" }}>
        <Button component={Link} variant="subtle" href={`/view/${id}`}>
          View
        </Button>

        <Button component={Link} variant="subtle" href={`/edit/${id}`}>
          Edit
        </Button>

        <Button component={Link} variant="subtle" href={`/delete/${id}`}>
          Delete
        </Button>
      </Box>
    </ListItem>
  );
};
