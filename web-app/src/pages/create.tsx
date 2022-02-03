import Head from "next/head";
import { useRouter } from "next/router";
import type { FieldValues } from "react-hook-form";
import { useQueryClient } from "react-query";
import { Box, Button, Title } from "@mantine/core";

import { EntryForm } from "components/EntryForm";
import { isUpdate, PollingUpdate } from "hooks/usePollingUpdates";

export default function Create() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const onSubmit = async (data: FieldValues) => {
    const title = (data?.["title"] ?? "").trim();
    const description = (data?.["description"] ?? "").trim();
    const privacy = data?.["privacy"] ?? false;

    if (title && description) {
      const updateInfo: PollingUpdate = await fetch("/api/search/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description, privacy })
      }).then((res) => res.json());

      // add updateInfo to total update query

      if (isUpdate(updateInfo)) {
        queryClient.setQueryData<PollingUpdate[]>("updates", (prev = []) => [
          ...prev,
          { ...updateInfo, key: "recent" }
        ]);
      }

      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Create</title>
      </Head>

      <Box
        component="header"
        sx={(theme) => ({ padding: theme.spacing.sm, display: "flex" })}
      >
        <Title
          order={2}
          sx={{ margin: "0 auto", fontWeight: 300, fontSize: "2rem" }}
        >
          Create a new entry
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
        <EntryForm onSubmit={onSubmit}>
          <Button type="submit"> Create</Button>
        </EntryForm>
      </Box>
    </>
  );
}
