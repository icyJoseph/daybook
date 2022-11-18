import React, { type ReactNode, useState, Fragment } from "react";
import { Box, Avatar, Button, AppShell } from "@mantine/core";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";

import { Home, Add, Login, Logout, Close, Menu, Time } from "grommet-icons";
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
  if (status === "pending") return <Time />;

  return loggedIn ? <Logout /> : <Login />;
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
              <Button
                component="a"
                variant="subtle"
                mb="lg"
                sx={(theme) => ({
                  "& svg": {
                    fill: theme.colors.blue[2],
                    stroke: theme.colors.blue[2],
                  },
                  ":hover svg": {
                    fill: theme.black,
                    stroke: theme.black,
                  },
                })}
              >
                <Home />
              </Button>
            }
            create={
              <Button
                component="a"
                variant="subtle"
                mb="lg"
                sx={(theme) => ({
                  "& svg": {
                    fill: theme.colors.blue[2],
                    stroke: theme.colors.blue[2],
                  },
                  ":hover svg": {
                    fill: theme.black,
                    stroke: theme.black,
                  },
                })}
              >
                <Add />
              </Button>
            }
            sideMenu={
              <Button
                onClick={toggleSideMenu}
                variant="subtle"
                mb="lg"
                sx={(theme) => ({
                  "& svg": {
                    fill: theme.colors.blue[2],
                    stroke: theme.colors.blue[2],
                  },
                  ":hover svg": {
                    fill: theme.black,
                    stroke: theme.black,
                  },
                })}
              >
                {sideMenuIsOpen ? <Close /> : <Menu />}
              </Button>
            }
          />

          <Box
            sx={{ placeSelf: "end", flexDirection: "column", display: "flex" }}
            pb="xl"
          >
            <Link href={`/api/auth/${loggedIn ? "logout" : "login"}`} passHref>
              <Button
                component="a"
                variant="subtle"
                sx={(theme) => ({
                  "& svg": {
                    fill: theme.colors.blue[2],
                    stroke: theme.colors.blue[2],
                  },
                  ":hover svg": {
                    fill: theme.black,
                    stroke: theme.black,
                  },
                })}
              >
                <LoginOptions
                  status={isLoading ? "pending" : "resolved"}
                  loggedIn={loggedIn}
                />
              </Button>
            </Link>
          </Box>
        </Aside>
      }
    >
      {user ? <Workspace>{children}</Workspace> : <NoUser />}
    </AppShell>
  );
};
