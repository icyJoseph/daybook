import { Fragment, ReactNode } from "react";
import Link from "next/link";

import { Anchor, Sidebar, Nav, Avatar } from "grommet";
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
      header={avatarUrl && <Avatar src={avatarUrl} />}
      footer={
        <Link href={`/api/auth/${loggedIn ? "logout" : "login"}`} passHref>
          <Anchor icon={loggedIn ? <Logout /> : <Login />} />
        </Link>
      }
    >
      {loggedIn ? (
        <Fragment>
          <Nav gap="small">
            <Link href={{ pathname: "/", query: homeQuery }} passHref>
              <Anchor icon={<Home />} />
            </Link>

            <Link href="/create" passHref>
              <Anchor icon={<Add />} />
            </Link>
          </Nav>

          {children}
        </Fragment>
      ) : null}
    </Sidebar>
  );
};
