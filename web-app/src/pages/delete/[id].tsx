import { MouseEventHandler } from "react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { Box, Button, Heading, Paragraph, Text } from "grommet";
import { Trash } from "grommet-icons";

import { Entry } from "interfaces/entry";
import auth0 from "utils/auth0";

export default function DeleteEntry({ entry }: { entry: Entry }) {
  const router = useRouter();

  const deleteHandler: MouseEventHandler<HTMLButtonElement> = async () => {
    const proceed = window.confirm(`Delete: ${entry.title}?`);
    if (proceed) {
      await fetch(`/api/search/delete/${entry.id}`, { method: "DELETE" }).then(
        (res) => res.json()
      );

      router.replace("/");
    }
  };
  return (
    <>
      <Head>
        <title>Delete</title>
      </Head>
      <Box width={{ max: "45ch" }} margin="0 auto">
        <Box margin={{ vertical: "16px" }}>
          <Button
            primary
            icon={<Trash />}
            label={<Text>DELETE</Text>}
            onClick={deleteHandler}
          />
        </Box>
        <Box>
          <Heading margin={{ bottom: "12px" }}>{entry.title}</Heading>
          <Paragraph>{entry.description}</Paragraph>
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
