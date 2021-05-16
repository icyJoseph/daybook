import { useEffect, useState } from "react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { Box, Button, Heading, Paragraph } from "grommet";

import { Entry } from "interfaces/entry";
import { stegcloak } from "utils/cloak";
import auth0 from "utils/auth0";

export default function ViewEntry({ entry }: { entry: Entry }) {
  const [cloak, setCloak] = useState(entry.privacy);
  const [description, setDescription] = useState(entry.description);

  useEffect(() => {
    if (entry.privacy && !cloak) {
      fetch("/api/reveal", { method: "POST", body: entry.description })
        .then((res) => res.json())
        .then(({ revealed }) => setDescription(revealed));
    } else if (entry.privacy) {
      setDescription(entry.description);
    }
  }, [cloak, entry.privacy, entry.description]);

  return (
    <>
      <Head>
        <title>{entry.title}</title>
      </Head>
      <Box width={{ max: "45ch" }} margin="0 auto">
        <Heading margin={{ bottom: "12px" }}>{entry.title}</Heading>
        <Paragraph>{description}</Paragraph>
        {entry.privacy && (
          <Button
            label={cloak ? "Reveal" : "Hide"}
            onClick={() => setCloak((x) => !x)}
          />
        )}
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

      if (entry.privacy) {
        entry.description = stegcloak.hide(
          entry.description,
          process.env.STEGCLOAK_SECRET,
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        );
      }

      return { props: { entry } };
    } catch (err) {
      return { notFound: true };
    }
  }
});
