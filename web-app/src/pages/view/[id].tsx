import { useEffect, useRef, useState } from "react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery } from "react-query";
import { Box, Heading } from "grommet";
import { Hide, Edit, Trash } from "grommet-icons";

import { Entry } from "interfaces/entry";
import { stegcloak } from "utils/cloak";
import auth0 from "utils/auth0";
import { Fab, FabBtn } from "components/Fab";
import { Markdown } from "components/Markdown";

const exists = <T,>(val: T | null | undefined): val is T =>
  val === (val ?? !val);

export default function ViewEntry({ initialData }: { initialData: Entry }) {
  const router = useRouter();

  const { data, ...rest } = useQuery<Entry>(
    ["entry", initialData.id],
    () =>
      fetch(`/api/search/entry/${initialData.id}`).then((res) => res.json()),
    {
      initialData,
      staleTime: Infinity
    }
  );

  const entry = data ?? initialData;

  const [revealed, setRevealed] = useState(null);
  const controlRef = useRef<AbortController | null>(null);

  console.log(rest);
  const reveal = async () => {
    if (exists(revealed)) return setRevealed(null);

    if (entry.privacy) {
      const controller = new AbortController();

      fetch("/api/reveal", {
        method: "POST",
        body: entry.description,
        signal: controller.signal
      })
        .then((res) => res.json())
        .then(({ revealed }) => setRevealed(revealed))
        .then(() => (controlRef.current = null));

      controlRef.current = controller;
    }
  };

  useEffect(() => {
    return () => {
      if (controlRef.current) {
        controlRef.current.abort();
      }
    };
  });

  const description = revealed ?? entry.description;
  const cloak = entry.privacy && !exists(revealed);

  return (
    <>
      <Head>
        <title>{entry.title}</title>
      </Head>
      <Box width={{ max: "65ch" }} margin="0 auto" pad="small">
        <Heading margin={{ bottom: "12px" }}>{entry.title}</Heading>
        <Markdown>{description}</Markdown>
        <Fab>
          {entry.privacy && (
            <FabBtn
              hoverIndicator
              icon={<Hide size="32px" color={cloak ? "neutral-2" : "brand"} />}
              onClick={reveal}
            />
          )}

          <FabBtn
            hoverIndicator
            icon={<Edit size="32px" color="neutral-3" />}
            onClick={() => router.push(`/edit/${entry.id}`)}
          />
          <FabBtn
            hoverIndicator
            icon={<Trash size="32px" color="neutral-4" />}
            onClick={() => router.push(`/delete/${entry.id}`)}
          />
        </Fab>
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

      const initialData = await res.json();

      if (initialData.privacy) {
        initialData.description = stegcloak.hide(
          initialData.description,
          process.env.STEGCLOAK_SECRET,
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        );
      }

      return { props: { initialData } };
    } catch (err) {
      return { notFound: true };
    }
  }
});
