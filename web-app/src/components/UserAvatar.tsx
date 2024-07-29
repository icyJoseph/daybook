import { Avatar } from "@mantine/core";

export const UserAvatar = ({ avatar }: { avatar?: string | null }) =>
  avatar ? (
    <Avatar
      mx="auto"
      src={avatar}
      alt="User Avatar"
      radius="xl"
      sx={{ placeSelf: "center" }}
    />
  ) : null;
