import { ReactElement, useState, useEffect, Fragment } from "react";
import { Box, Text, Button } from "@mantine/core";
import { Sidebar } from "grommet-icons";

import { useUser } from "@auth0/nextjs-auth0";

import { Grid, GridAside, GridMain, GridWorkspace } from "components/Grid";
import { Recent } from "components/Recent";
import { SideMenu } from "components/SideMenu";
import { PollingUpdates } from "hooks/usePollingUpdates";
import { useStats } from "hooks/useStats";

const NoUser = () => (
  <Box
    sx={{
      gridArea: "g-workspace",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text component="p" size="lg">
      Login to start
    </Text>
  </Box>
);

const Workspace = ({
  docked,
  close,
  sideBarOpen,
  children,
}: {
  docked: boolean;
  close: () => void;
  sideBarOpen: boolean;
  children: ReactElement;
}) => {
  return (
    <Fragment>
      <PollingUpdates />

      <GridWorkspace>
        <GridAside as="section" sideBarOpen={sideBarOpen}>
          <Recent close={close} docked={docked} />
        </GridAside>

        <GridMain sideBarOpen={sideBarOpen}>{children}</GridMain>
      </GridWorkspace>
    </Fragment>
  );
};

export const Application = ({ children }: { children: ReactElement }) => {
  const { user, error, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  // this seeds any other query made for stats, for example
  // the query done in Search
  useStats(!!user);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

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

  const close = () => setOpen(false);

  if (isLoading) return null;

  return (
    <Grid>
      <SideMenu loggedIn={loggedIn} gridArea="g-menu" avatarUrl={picture}>
        {!docked && (
          <Button
            variant="subtle"
            onClick={() => setOpen((x) => !x)}
            sx={(theme) => ({
              ":hover svg": {
                fill: theme.black,
                stroke: theme.black,
              },
            })}
          >
            <Sidebar />
          </Button>
        )}
      </SideMenu>

      {user ? (
        <Workspace sideBarOpen={shouldOpen} close={close} docked={docked}>
          {children}
        </Workspace>
      ) : (
        <NoUser />
      )}
    </Grid>
  );
};
