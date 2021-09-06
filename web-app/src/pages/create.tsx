import Head from "next/head";
import { useRouter } from "next/router";
import { FieldValues } from "react-hook-form";
import { useQueryClient } from "react-query";
import { Box, Button, Heading } from "grommet";

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

      <Box as="header" pad="small">
        <Heading as="h2" margin="0 auto">
          Create a new entry
        </Heading>
      </Box>

      <Box
        responsive
        as="main"
        width={{ max: "65ch" }}
        margin="12px auto"
        pad="medium"
      >
        <EntryForm onSubmit={onSubmit}>
          <Button type="submit" primary label="Create" />
        </EntryForm>
      </Box>
    </>
  );
}
