import { MouseEventHandler } from "react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";

import { Box, Button, Title, Text } from "@mantine/core";
import { Trash } from "grommet-icons";

import { Entry } from "interfaces/entry";
import auth0 from "utils/auth0";
import { isUpdate, PollingUpdate } from "hooks/usePollingUpdates";

export default function DeleteEntry({ entry }: { entry: Entry }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteHandler: MouseEventHandler<HTMLButtonElement> = async () => {
    const proceed = window.confirm(`Delete: ${entry.title}?`);

    if (proceed) {
      const updateInfo = await fetch(`/api/search/delete/${entry.id}`, {
        method: "DELETE"
      }).then((res) => res.json());

      if (isUpdate(updateInfo)) {
        queryClient.setQueryData<PollingUpdate[]>("updates", (prev = []) => [
          ...prev,
          { ...updateInfo, key: "recent" }
        ]);
      }

      router.replace("/");
    }
  };

  return (
    <>
      <Head>
        <title>Delete</title>
      </Head>
      <Box
        component="main"
        sx={(theme) => ({
          width: "65ch",
          margin: "12px auto",
          padding: theme.spacing.md
        })}
      >
        <Box sx={{ margin: "16px auto" }}>
          <Button
            leftIcon={<Trash color="white" />}
            onClick={deleteHandler}
            color="red"
            fullWidth
            uppercase
          >
            DELETE
          </Button>
        </Box>
        <Box>
          <Title order={1} mb="md" sx={{ fontSize: "3rem", fontWeight: 300 }}>
            {entry.title}
          </Title>

          <Text component="p">{entry.description}</Text>
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps = auth0.withPageAuthRequired({
  getServerSideProps: async (context: GetServerSidePropsContext) => {
    const { id } = context.query;

    if (!id) return { redirect: { destination: "/", permanent: false } };

    try {
      const { accessToken } = await auth0.getAccessToken(
        context.req,
        context.res
      );

      const res = await fetch(`${process.env.PROXY_URL}/entry/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) throw res;

      const entry = await res.json();

      return { props: { entry } };
    } catch (err) {
      return { notFound: true };
    }
  }
});
