import { Fragment, ReactNode } from "react";
import Link from "next/link";

import { Avatar, Button } from "@mantine/core";

import { Sidebar, Nav } from "grommet";
import { Home, Add, Login, Logout } from "grommet-icons";
import { UserProfile } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";

export const SideMenu = ({
  gridArea,
  loggedIn,
  avatarUrl,
  children
}: {
  gridArea: string;
  loggedIn: boolean;
  avatarUrl?: UserProfile["picture"];
  children?: ReactNode;
}) => {
  const router = useRouter();
  const homeQuery = router.pathname === "/" ? { q: router.query.q } : {};
  return (
    <Sidebar
      gridArea={gridArea}
      background="neutral-2"
      header={
        avatarUrl && (
          <Avatar mx="auto" src={avatarUrl} alt="User Avatar" radius="xl" />
        )
      }
      footer={
        <Link href={`/api/auth/${loggedIn ? "logout" : "login"}`} passHref>
          <Button
            component="a"
            variant="subtle"
            sx={(theme) => ({
              "& svg": {
                fill: theme.colors.blue[2],
                stroke: theme.colors.blue[2]
              },
              ":hover svg": {
                fill: theme.black,
                stroke: theme.black
              }
            })}
          >
            {loggedIn ? <Logout /> : <Login />}
          </Button>
        </Link>
      }
    >
      {loggedIn ? (
        <Fragment>
          <Nav gap="small">
            <Link href={{ pathname: "/", query: homeQuery }} passHref>
              <Button
                component="a"
                variant="subtle"
                mb="lg"
                sx={(theme) => ({
                  "& svg": {
                    fill: theme.colors.blue[2],
                    stroke: theme.colors.blue[2]
                  },
                  ":hover svg": {
                    fill: theme.black,
                    stroke: theme.black
                  }
                })}
              >
                <Home />
              </Button>
            </Link>

            <Link href="/create" passHref>
              <Button
                component="a"
                variant="subtle"
                mb="lg"
                sx={(theme) => ({
                  "& svg": {
                    fill: theme.colors.blue[2],
                    stroke: theme.colors.blue[2]
                  },
                  ":hover svg": {
                    fill: theme.black,
                    stroke: theme.black
                  }
                })}
              >
                <Add />
              </Button>
            </Link>
          </Nav>

          {children}
        </Fragment>
      ) : null}
    </Sidebar>
  );
};
