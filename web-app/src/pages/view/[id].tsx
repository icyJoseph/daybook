import { useRouter } from "next/router";
import Head from "next/head";
import ErrorPage from "next/error";
import { useQuery, useQueryClient, InfiniteData } from "react-query";
import { Title } from "@mantine/core";

import { Entry } from "interfaces/entry";
import { Markdown } from "components/Markdown";
import { Result } from "interfaces/result";

class ViewError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    this.name = "ViewError";

    this.statusCode = statusCode;
  }
}

const fetchViewEntry = async (id: string | string[] | undefined) => {
  if (typeof id === "undefined") {
    throw new ViewError("Id was undefined");
  }

  if (Array.isArray(id)) {
    throw new ViewError("Invalid Id", 401);
  }

  const response = await fetch(`/api/search/entry/${id}`);

  if (!response.ok) {
    if (response.status === 404 || response.status === 401) {
      const data = await response.json();
      throw new ViewError(data?.message || "Unexpected Error", response.status);
    }
    throw new ViewError("Unexpected Error", response.status);
  }

  return response.json();
};

type Predicate = (entry: Entry) => boolean;

const findEntry = (pages: Result<Entry>[], predicate: Predicate) => {
  for (const page of pages) {
    for (const entry of page.hits) {
      if (predicate(entry)) {
        return entry;
      }
    }
  }

  return null;
};

export default function ViewEntry() {
  const router = useRouter();

  const { id } = router.query;

  const queryClient = useQueryClient();

  const { data: entry, error } = useQuery<Entry, ViewError>(
    ["entry", id],
    () => fetchViewEntry(id),
    {
      staleTime: Infinity,
      initialData: () => {
        const matches = queryClient.getQueriesData<
          InfiniteData<Result<Entry>> | undefined
        >(["recent"]);

        for (const [_, list] of matches) {
          const entry = findEntry(
            list?.pages ?? [],
            (entry) => entry.id === id
          );

          if (entry) return entry;
        }

        return undefined;
      },
      onSuccess: (data) => {
        queryClient.setQueryData<InfiniteData<Result<Entry>>>(
          "recent",
          (recent) => {
            const pages =
              recent?.pages?.map((page) => ({
                ...page,
                hits: page.hits.map((hit) => (hit.id === data.id ? data : hit)),
              })) ?? [];

            return {
              pages,
              pageParams: recent?.pageParams ?? [],
            };
          }
        );
      },
    }
  );

  if (error)
    return (
      <ErrorPage statusCode={error.statusCode || 400} title={error.message} />
    );

  if (!entry) return null;

  const description = entry.description;

  return (
    <>
      <Head>
        <title>{entry.title}</title>
      </Head>

      <>
        <Title mb="md" sx={{ fontSize: "3rem", fontWeight: 300 }}>
          {entry.title}
        </Title>

        <Markdown>{description}</Markdown>
      </>
    </>
  );
}
