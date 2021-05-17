import Link from "next/link";

import { Anchor, Sidebar, Nav, Button, Avatar } from "grommet";
import {
  Clock,
  Calendar,
  // Organization,
  // Tag,
  Home,
  Add,
  Login,
  Logout
} from "grommet-icons";
import { UserProfile } from "@auth0/nextjs-auth0";

type RecentHandler = ({ days, label }: { days: number; label: string }) => void;

export const SideMenu = ({
  gridArea,
  loggedIn,
  recentHandler,
  avatarUrl
}: {
  gridArea: string;
  loggedIn: boolean;
  avatarUrl?: UserProfile["picture"];
  recentHandler: RecentHandler;
}) => (
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
    <Nav gap="small">
      <Link href="/" passHref>
        <Anchor icon={<Home />} />
      </Link>

      <Link href="/create" passHref>
        <Anchor icon={<Add />} />
      </Link>

      <Button
        hidden={!loggedIn}
        icon={<Clock />}
        hoverIndicator
        onClick={() => recentHandler({ days: 7, label: "Week" })}
      />

      <Button
        hidden={!loggedIn}
        icon={<Calendar />}
        hoverIndicator
        onClick={() => recentHandler({ days: 31, label: "Month" })}
      />

      {/* <Button
        hidden={!loggedIn}
        icon={<Organization />}
        hoverIndicator
        onClick={() => recentHandler((x) => !x)}
      /> */}

      {/* <Button
        hidden={!loggedIn}
        icon={<Tag />}
        hoverIndicator
        onClick={() => recentHandler((x) => !x)}
      /> */}
    </Nav>
  </Sidebar>
);
