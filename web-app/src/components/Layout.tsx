import { FC, useState, useEffect, Fragment } from "react";
import { Box, Text } from "grommet";
import { useUser } from "@auth0/nextjs-auth0";

import { Grid, GridAside, GridMain, GridWorkspace } from "components/Grid";
import { Recent } from "components/Recent";
import { SideMenu } from "components/SideMenu";
import { PollingUpdates } from "hooks/usePollingUpdates";

const NoUser = () => (
  <Box gridArea="g-workspace" flex justify="center" align="center">
    <Text>Login to start</Text>
  </Box>
);

const Workspace: FC<{
  days: number;
  sideBarOpen: boolean;
}> = ({ days, sideBarOpen, children }) => {
  return (
    <Fragment>
      <PollingUpdates />
      <GridWorkspace>
        <GridAside as="section" sideBarOpen={sideBarOpen}>
          <Recent days={days} />
        </GridAside>

        <GridMain sideBarOpen={sideBarOpen}>{children}</GridMain>
      </GridWorkspace>
    </Fragment>
  );
};

export const Application: FC<{}> = ({ children }) => {
  const { user, error, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 630px)");

    const handler = () => {
      setDocked(query.matches);
    };

    handler();
    query.addEventListener("change", handler);

    return () => query.removeEventListener("change", handler);
  }, [setDocked]);

  const shouldOpen = docked || open;
  const picture = user?.picture;
  const loggedIn = !isLoading && !!user && !error;

  const [recentDays, setRecentDays] = useState(7);

  if (isLoading) return null;

  return (
    <Grid>
      <SideMenu
        loggedIn={loggedIn}
        gridArea="g-menu"
        recentHandler={({ days }) => {
          setOpen((x) => !x);
          setRecentDays(days);
        }}
        avatarUrl={picture}
      />

      {user ? (
        <Workspace sideBarOpen={shouldOpen} days={recentDays}>
          {children}
        </Workspace>
      ) : (
        <NoUser />
      )}
    </Grid>
  );
};
