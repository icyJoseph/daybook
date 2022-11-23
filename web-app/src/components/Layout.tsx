import React, { type ReactNode, useState } from "react";
import { Box, AppShell, ActionIcon } from "@mantine/core";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { IconHome, IconPlus, IconLogout, IconX, IconMenu } from "@tabler/icons";

import { Recent } from "components/Recent";
import { SideMenu } from "components/SideMenu";
import { NoUser } from "components/NoUser";
import { Workspace } from "components/Workspace";
import { UserAvatar } from "components/UserAvatar";
import { Navigation } from "components/Navigation";
import { Aside } from "components/Aside";

import { useStats } from "hooks/useStats";

const appShellStyles = {
  root: { height: "100%" },
  main: { height: "100%", overflowX: "scroll", paddingTop: 0 },
  body: { height: "100%" },
} as const;

export const Application = ({ children }: { children: ReactNode }) => {
  const { user, error, isLoading } = useUser();
  const [sideMenuIsOpen, setSideMenu] = useState(false);

  // this seeds any other query made for stats, for example
  // the query done in Search
  useStats(!!user);

  const picture = user?.picture;
  const loggedIn = !isLoading && !!user && !error;

  const close = () => setSideMenu(false);
  const toggleSideMenu = () => setSideMenu((x) => !x);

  return (
    <AppShell
      styles={appShellStyles}
      fixed
      navbar={
        loggedIn ? (
          <SideMenu
            open={sideMenuIsOpen}
            recent={user ? <Recent onClose={close} /> : null}
          />
        ) : (
          <></>
        )
      }
      aside={
        <Aside>
          <UserAvatar avatar={picture} />

          <Navigation
            loggedIn={loggedIn}
            home={
              <ActionIcon
                component="a"
                variant="transparent"
                aria-label="Navigate to landing page"
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
                <IconHome />
              </ActionIcon>
            }
            create={
              <ActionIcon
                component="a"
                variant="transparent"
                aria-label="Create a new entry"
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
                <IconPlus />
              </ActionIcon>
            }
            sideMenu={
              <ActionIcon
                onClick={toggleSideMenu}
                component="a"
                aria-label={
                  sideMenuIsOpen ? "Close side menu" : "Open side menu"
                }
                variant="transparent"
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
                {sideMenuIsOpen ? <IconX /> : <IconMenu />}
              </ActionIcon>
            }
          />

          <Box
            sx={{
              placeSelf: "end",
              display: loggedIn ? "block" : "none",
            }}
            mx="auto"
            pb="xl"
          >
            <Link href="/api/auth/logout" passHref>
              <ActionIcon
                component="a"
                variant="transparent"
                aria-label="Logout from session"
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
                <IconLogout />
              </ActionIcon>
            </Link>
          </Box>
        </Aside>
      }
    >
      {user ? <Workspace>{children}</Workspace> : <NoUser />}
    </AppShell>
  );
};
