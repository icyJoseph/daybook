import { Box, Text } from "@mantine/core";

export const NoUser = () => (
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
