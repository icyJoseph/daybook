import Head from "next/head";
import auth0 from "utils/auth0";
import { FieldValues, useForm } from "react-hook-form";
import {
  Box,
  CheckBox,
  FormField,
  Heading,
  Form,
  Button,
  TextInput,
  TextArea
} from "grommet";
import { useRouter } from "next/router";

export default function Profile() {
  const router = useRouter();

  const { register, handleSubmit } = useForm();

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
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <TextInput
              placeholder="title"
              autoComplete="off"
              {...register("title", { required: true })}
            />
          </FormField>
          <FormField>
            <TextArea
              rows={5}
              resize="vertical"
              placeholder="description"
              {...register("description", { required: true })}
            />
          </FormField>

          <Box margin={{ vertical: "2rem" }}>
            <CheckBox label="Private?" {...register("privacy")} />
          </Box>
          <Button type="submit" primary label="Create" />
        </Form>
      </Box>
    </>
  );
}

export const getServerSideProps = auth0.withPageAuthRequired();
