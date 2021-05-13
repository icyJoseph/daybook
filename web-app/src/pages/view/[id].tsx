import Head from "next/head";
import auth0 from "utils/auth0";
import { GetServerSidePropsContext } from "next";

import { Box, Heading, Paragraph } from "grommet";

import { Entry } from "interfaces/entry";

export default function ViewEntry({ entry }: { entry: Entry }) {
  return (
    <>
      <Head>
        <title>{entry.title}</title>
      </Head>
      <Box width={{ max: "45ch" }} margin="0 auto">
        <Heading margin={{ bottom: "12px" }}>{entry.title}</Heading>
        <Paragraph>
          <span>{entry.description}</span>
        </Paragraph>
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

      const entry = await fetch(`${process.env.PROXY_URL}/entry/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }).then((res) => res.json());

      return { props: { entry } };
    } catch (err) {
      return { notFound: true };
    }
  }
});
