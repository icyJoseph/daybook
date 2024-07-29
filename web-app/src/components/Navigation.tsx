import { type ReactNode, Fragment } from "react";
import { Box, ActionIcon } from "@mantine/core";

import Link from "next/link";

import { IconPencil, IconTrash } from "@tabler/icons";
import { useRouter } from "next/router";

export const Navigation = ({
  loggedIn,
  home,
  create,
  sideMenu,
}: {
  loggedIn: boolean;
  home: ReactNode;
  create: ReactNode;
  sideMenu: ReactNode;
}) => {
  const router = useRouter();

  const homeQuery = router.pathname === "/" ? { q: router.query.q } : {};

  const { id } = router.query;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {loggedIn ? (
        <Fragment>
          <Box
            sx={{
              display: "block",
              "@media (min-width: 769px)": {
                display: "none",
              },
            }}
          >
            {sideMenu}
          </Box>

          <Link href={{ pathname: "/", query: homeQuery }} passHref>
            {home}
          </Link>

          <Link href="/create" passHref>
            {create}
          </Link>

          {typeof id === "string" && (
            <>
              <ActionIcon
                component={Link}
                href={`/edit/${id}`}
                variant="transparent"
                aria-label="Navigate to edit entry"
                mx="auto"
                mb="lg"
                sx={(theme) => ({
                  "& svg": {
                    stroke: theme.colors.blue[2],
                  },
                  ":hover svg": {
                    stroke: theme.colors.blue[4],
                  },
                })}
              >
                <IconPencil />
              </ActionIcon>
              <ActionIcon
                component={Link}
                href={`/delete/${id}`}
                variant="transparent"
                aria-label="Navigate to delete entry"
                mx="auto"
                mb="lg"
                sx={(theme) => ({
                  "& svg": {
                    stroke: theme.colors.red[4],
                  },
                  ":hover svg": {
                    stroke: theme.colors.red[6],
                  },
                })}
              >
                <IconTrash />
              </ActionIcon>
            </>
          )}
        </Fragment>
      ) : null}
    </Box>
  );
};
