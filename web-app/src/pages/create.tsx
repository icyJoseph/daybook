import Head from "next/head";
import { useRouter } from "next/router";
import { FieldValues } from "react-hook-form";
import { Box, Button, Heading } from "grommet";

import { EntryForm } from "components/EntryForm";
import auth0 from "utils/auth0";

export default function Create() {
  const router = useRouter();

  const onSubmit = async (data: FieldValues) => {
    const title = (data?.["title"] ?? "").trim();
    const description = (data?.["description"] ?? "").trim();
    const privacy = data?.["privacy"] ?? false;

    if (title && description) {
      await fetch("/api/search/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description, privacy })
      });

      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Create</title>
      </Head>
      <Box as="header">
        <Heading as="h2" margin="0 auto">
          Create a new entry
        </Heading>
      </Box>
      <Box as="main" width={{ max: "45ch" }} margin="12px auto">
        <EntryForm onSubmit={onSubmit}>
          <Button type="submit" primary label="Create" />
        </EntryForm>
      </Box>
    </>
  );
}

export const getServerSideProps = auth0.withPageAuthRequired();
