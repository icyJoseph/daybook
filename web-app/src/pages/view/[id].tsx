import { useEffect, useRef, useState } from "react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery, useQueryClient } from "react-query";
import { Box, Heading } from "grommet";
import { Hide, Edit, Trash } from "grommet-icons";

import { Entry } from "interfaces/entry";
import auth0 from "utils/auth0";
import { Fab, FabBtn } from "components/Fab";
import { Markdown } from "components/Markdown";
import { Result } from "interfaces/result";

const exists = <T,>(val: T | null | undefined): val is T =>
  val === (val ?? !val);

export default function ViewEntry({ id }: { id: Entry["id"] }) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: entry } = useQuery<Entry>(
    ["entry", id],
    () => fetch(`/api/search/entry/${id}`).then((res) => res.json()),
    {
      staleTime: Infinity,
      initialData: () => {
        const matches = queryClient.getQueriesData<Result<Entry>>(["recent"]);

        for (const [_, list] of matches) {
          const entry = list?.hits.find((entry) => entry.id === id);

          if (entry) return entry;
        }

        return undefined;
      }
    }
  );

  const [revealed, setRevealed] = useState(null);
  const controlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setRevealed(null);
  }, [id, setRevealed]);

  const reveal = async () => {
    if (!entry) return;

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

  if (!entry) return null;

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

      if (!accessToken)
        return { redirect: { destination: "/", permanent: false } };

      const res = await fetch(`${process.env.PROXY_URL}/entry/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) return { notFound: true };

      return { props: { id } };
    } catch (err) {
      return { redirect: { destination: "/", permanent: false } };
    }
  }
});
