import {
  FC,
  useState,
  useEffect,
  Fragment,
  Dispatch,
  SetStateAction
} from "react";
import styled from "styled-components";
import Link from "next/link";
import { Box, Header, Anchor, Nav, Heading, Text } from "grommet";
import { Home, Add, Logout, Login } from "grommet-icons";
import { UserProfile, useUser } from "@auth0/nextjs-auth0";

import {
  Grid,
  GridHeader,
  GridAside,
  GridMain,
  GridWorkspace
} from "components/Grid";
import { Recent } from "components/Recent";
import { SideMenu } from "components/SideMenu";

export const TopBar: FC = () => {
  const { user } = useUser();

  return (
    <Header background="brand" flex={{ grow: 0, shrink: 0 }} basis="4rem">
      <Link href="/" passHref>
        <Anchor margin="8px 12px">
          <Heading color="accent-1">Daybook</Heading>
        </Anchor>
      </Link>
      <Box margin="0 auto" />
      <Nav flex direction="row" justify="end" pad="xxsmall" margin="8px 12px">
        <Link href="/" passHref>
          <Anchor icon={<Home />} />
        </Link>

        <Link href="/create" passHref>
          <Anchor icon={<Add />} />
        </Link>
        <Link href={`/api/auth/${user ? "logout" : "login"}`} passHref>
          <Anchor icon={user ? <Logout /> : <Login />} />
        </Link>
      </Nav>
    </Header>
  );
};

const NoUser = () => (
  <Box gridArea="g-workspace" flex justify="center" align="center">
    <Text>Login to start</Text>
  </Box>
);

const WithUser: FC<{
  shouldOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  picture: UserProfile["picture"];
}> = ({ shouldOpen, picture, setOpen, children }) => (
  <Fragment>
    <SideMenu gridArea="g-menu" recentHandler={setOpen} avatarUrl={picture} />
    <GridWorkspace>
      <GridAside as="section" open={shouldOpen}>
        <Recent />
      </GridAside>

      <GridMain open={shouldOpen}>{children}</GridMain>
    </GridWorkspace>
  </Fragment>
);

export const Container = styled.section`
  flex: 1 1 auto;
  overflow-y: auto;
`;

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

  if (isLoading) return null;

  return (
    <Grid>
      <GridHeader>
        <Heading as="h2" margin="8px 12px">
          Welcome{user ? `, ${user.name}` : ""}
        </Heading>
        {error && <span>{error.message}</span>}
      </GridHeader>

      {user ? (
        <WithUser
          picture={user?.picture}
          shouldOpen={shouldOpen}
          setOpen={setOpen}
        >
          {children}
        </WithUser>
      ) : (
        <NoUser />
      )}
    </Grid>
  );
};
