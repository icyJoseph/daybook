import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { Box, Heading, Paragraph } from "grommet";

import { Entry } from "interfaces/entry";
import auth0 from "utils/auth0";

export default function ViewEntry({ entry }: { entry: Entry }) {
  return (
    <>
      <Head>
        <title>{entry.title}</title>
      </Head>
      <Box width={{ max: "45ch" }} margin="0 auto">
        <Heading margin={{ bottom: "12px" }}>{entry.title}</Heading>
        <Paragraph>{entry.description}</Paragraph>
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
