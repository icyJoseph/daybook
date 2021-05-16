import { useEffect, useState } from "react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { Box, Heading, Paragraph } from "grommet";

import { Entry } from "interfaces/entry";
import { stegcloak } from "utils/cloak";
import auth0 from "utils/auth0";
import { Fab } from "components/Fab";
import { Hide } from "grommet-icons";

export default function ViewEntry({ entry }: { entry: Entry }) {
  const [cloak, setCloak] = useState(entry.privacy);
  const [revealed, setRevealed] = useState(entry.description);

  useEffect(() => {
    if (entry.privacy) {
      setCloak(true);
      const controller = new AbortController();
      fetch("/api/reveal", {
        method: "POST",
        body: entry.description,
        signal: controller.signal
      })
        .then((res) => res.json())
        .then(({ revealed }) => setRevealed(revealed));

      return () => controller.abort();
    } else {
      setCloak(false);
      setRevealed(entry.description);
    }
  }, [entry.privacy, entry.description]);

  const description = cloak ? entry.description : revealed;

  return (
    <>
      <Head>
        <title>{entry.title}</title>
      </Head>
      <Box width={{ max: "45ch" }} margin="0 auto">
        <Heading margin={{ bottom: "12px" }}>{entry.title}</Heading>
        <Paragraph>{description}</Paragraph>
        {entry.privacy && (
          <Fab
            hoverIndicator
            icon={<Hide size="large" color={cloak ? "neutral-2" : "brand"} />}
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
