import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FieldValues } from "react-hook-form";
import { useQueryClient } from "react-query";
import { Box, Button, Title } from "@mantine/core";

import { EntryForm } from "components/EntryForm";
import { Entry } from "interfaces/entry";
import auth0 from "utils/auth0";
import { isUpdate, PollingUpdate } from "hooks/usePollingUpdates";

export default function EditEntry({ entry }: { entry: Entry }) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const onSubmit = async (data: FieldValues) => {
    const title = (data?.["title"] ?? "").trim();
    const description = (data?.["description"] ?? "").trim();
    const privacy = data?.["privacy"] ?? false;

    if (title && description) {
      const updateInfo = await fetch("/api/search/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          current: entry,
          next: { ...entry, title, description, privacy }
        })
      }).then((res) => res.json());

      if (isUpdate(updateInfo)) {
        queryClient.setQueryData<PollingUpdate[]>("updates", (prev = []) => [
          ...prev,
          { ...updateInfo, key: ["entry", entry.id] }
        ]);
      }

      router.push(`/view/${entry.id}`);
    }
  };

  return (
    <>
      <Head>
        <title>Edit</title>
      </Head>

      <Box
        component="header"
        sx={(theme) => ({ padding: theme.spacing.sm, display: "flex" })}
      >
        <Title
          order={2}
          sx={{ margin: "0 auto", fontWeight: 300, fontSize: "2rem" }}
        >
          Edit an entry
        </Title>
      </Box>

      <Box
        component="main"
        sx={(theme) => ({
          width: "65ch",
          margin: "12px auto",
          padding: theme.spacing.md
        })}
      >
        <EntryForm onSubmit={onSubmit} initialValues={{ ...entry }}>
          <Button type="submit">Save</Button>
        </EntryForm>
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
