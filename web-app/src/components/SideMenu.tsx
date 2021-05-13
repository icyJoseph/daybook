import { UserProfile } from "@auth0/nextjs-auth0";
import { Sidebar, Nav, Button, Avatar } from "grommet";
import { Clock } from "grommet-icons";
import { Dispatch, SetStateAction } from "react";

export const SideMenu = ({
  gridArea,
  recentHandler,
  avatarUrl
}: {
  gridArea: string;
  avatarUrl?: UserProfile["picture"];
  recentHandler: Dispatch<SetStateAction<boolean>>;
}) => (
  <Sidebar
    gridArea={gridArea}
    background="neutral-2"
    header={avatarUrl && <Avatar src={avatarUrl} />}
  >
    <Nav gap="small">
      <Button
        icon={<Clock />}
        hoverIndicator
        onClick={() => recentHandler((x) => !x)}
      />
    </Nav>
  </Sidebar>
);
