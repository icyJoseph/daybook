import React, { type ReactNode, useState, Fragment } from "react";
import { Box, Avatar, AppShell, ActionIcon } from "@mantine/core";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";

import {
  IconHome,
  IconPlus,
  IconLogin,
  IconLogout,
  IconX,
  IconMenu,
  IconHourglass,
  IconPencil,
  IconTrash,
} from "@tabler/icons";
import { Recent } from "components/Recent";
import { SideMenu } from "components/SideMenu";
import { useStats } from "hooks/useStats";
import { useRouter } from "next/router";
import { NoUser } from "components/NoUser";
import { Workspace } from "./Workspace";

const appShellStyles = {
  root: { height: "100%" },
  main: { height: "100%", overflowX: "scroll", paddingTop: 0 },
  body: { height: "100%" },
} as const;

const UserAvatar = ({ avatar }: { avatar?: string | null }) =>
  avatar ? (
    <Avatar
      mx="auto"
      src={avatar}
      alt="User Avatar"
      radius="xl"
      sx={{ placeSelf: "center" }}
    />
  ) : (
    <div />
  );

const LoginOptions = ({
  status,
  loggedIn,
}: {
  status: "pending" | "resolved";
  loggedIn: boolean;
}) => {
  if (status === "pending") return <IconHourglass />;

  return loggedIn ? <IconLogout /> : <IconLogin />;
};

const Navigation = ({
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

const Aside = ({ children }: { children: ReactNode | ReactNode[] }) => (
  <Box
    component="aside"
    sx={(theme) => ({
      display: "grid",
      gridTemplateRows: "5rem 1fr 1fr",
      backgroundColor: theme.colors.gray[9],
      flexBasis: "3rem",
    })}
  >
    {children}
  </Box>
);

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
        <SideMenu
          open={sideMenuIsOpen}
          recent={user ? <Recent onClose={close} /> : null}
        />
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
              flexDirection: "column",
              display: "flex",
            }}
            mx="auto"
            pb="xl"
          >
            <Link href={`/api/auth/${loggedIn ? "logout" : "login"}`} passHref>
              <ActionIcon
                component="a"
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
                <LoginOptions
                  status={isLoading ? "pending" : "resolved"}
                  loggedIn={loggedIn}
                />
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
