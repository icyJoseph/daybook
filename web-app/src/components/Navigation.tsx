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
              <Link href={`/edit/${id}`} passHref>
                <ActionIcon
                  variant="transparent"
                  component="a"
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
              </Link>
              <Link href={`/delete/${id}`} passHref>
                <ActionIcon
                  variant="transparent"
                  component="a"
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
              </Link>
            </>
          )}
        </Fragment>
      ) : null}
    </Box>
  );
};
