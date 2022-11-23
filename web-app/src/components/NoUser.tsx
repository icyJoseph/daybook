import { Box, Button, Text } from "@mantine/core";
import { IconLogin } from "@tabler/icons";
import Link from "next/link";

export const NoUser = () => (
  <Box
    sx={{
      gridArea: "g-workspace",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      height: "100%",
    }}
  >
    <Text component="p" size="lg" mb="lg">
      You need to login to start using this service
    </Text>

    <Link href="/api/auth/login" passHref>
      <Button
        component="a"
        aria-label="Initiate session"
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
        leftIcon={<IconLogin />}
      >
        Login
      </Button>
    </Link>
  </Box>
);
