import Link from "next/link";
import { Box, Button, Card, Text, Title, Group } from "@mantine/core";
import { Trash, Edit, Calendar, View } from "grommet-icons";
import type { Entry } from "interfaces/entry";

type Mode = {
  preview?: boolean;
};

export const EntryCard = ({
  id,
  title,
  description,
  created_at,
  preview = false
}: Entry & Mode) => {
  const date = new Date(created_at * 1000).toLocaleDateString();

  return (
    <Card
      shadow="lg"
      sx={(theme) => ({
        background: theme.colors.gray[1],
        display: "flex",
        flexDirection: "column",
        maxWidth: "30ch"
      })}
      m="8px auto 16px"
      padding="md"
    >
      <Group position="apart" direction="column" mb="lg">
        <Title
          order={2}
          align="left"
          sx={{ fontSize: "1.5rem", fontWeight: 300 }}
        >
          {title}
        </Title>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
          <Calendar />

          <Text component="p" ml="sm">
            <time dateTime={date}>{date}</time>
          </Text>
        </Box>
      </Group>

      {!preview && (
        <Box
          sx={(theme) => ({
            padding: theme.spacing.md,
            background: theme.colors.gray[2]
          })}
        >
          <Text component="p">{description}</Text>
        </Box>
      )}

      <Card.Section sx={(theme) => ({ background: theme.colors.gray[3] })}>
        <Box
          sx={(theme) => ({
            padding: theme.spacing.xs,
            display: "flex",
            justifyContent: "space-around"
          })}
        >
          <Link href={`/view/${id}`} passHref>
            <Button component="a" variant="subtle">
              <View color="neutral-1" />
            </Button>
          </Link>

          <Link href={`/edit/${id}`} passHref>
            <Button component="a" variant="subtle">
              <Edit color="neutral-3" />
            </Button>
          </Link>

          <Link href={`/delete/${id}`} passHref>
            <Button component="a" variant="subtle">
              <Trash color="neutral-4" />
            </Button>
          </Link>
        </Box>
      </Card.Section>
    </Card>
  );
};
