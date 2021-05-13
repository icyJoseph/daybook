import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useRef } from "react";
import {
  Box,
  FormField,
  Heading,
  Form,
  Button,
  FormExtendedEvent,
  TextInput,
  TextArea
} from "grommet";
import { useRouter } from "next/router";

export default function Profile() {
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();

  const handleSubmit = async (e: FormExtendedEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const title = (titleRef.current?.value ?? "").trim();
    const description = (descriptionRef.current?.value ?? "").trim();

    if (title && description) {
      await fetch("/api/search/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description })
      });

      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Create</title>
      </Head>
      <header>
        <Heading as="h2">Create a new entry</Heading>
      </header>
      <Box as="main" width="50%">
        <Form onSubmit={handleSubmit}>
          <FormField>
            <TextInput
              name="title"
              ref={titleRef}
              placeholder="title"
              autoComplete="off"
            />
          </FormField>
          <FormField>
            <TextArea
              name="description"
              ref={descriptionRef}
              placeholder="description"
            />
          </FormField>
          <Button type="submit" primary label="Create" />
        </Form>
      </Box>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired();
