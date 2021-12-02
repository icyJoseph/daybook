import { useRouter } from "next/router";
import Head from "next/head";
import ErrorPage from "next/error";
import { useQuery, useQueryClient } from "react-query";
import { Box, Heading } from "grommet";
import { Edit, Trash } from "grommet-icons";

import { Entry } from "interfaces/entry";
import { Fab, FabBtn } from "components/Fab";
import { Markdown } from "components/Markdown";
import { Result } from "interfaces/result";

class ViewError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    this.name = "ViewError";

    this.statusCode = statusCode;
  }
}

const fetchViewEntry = async (id: string | string[]) => {
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
        const matches = queryClient.getQueriesData<Result<Entry>>(["recent"]);

        for (const [_, list] of matches) {
          const entry = list?.hits.find((entry) => entry.id === id);

          if (entry) return entry;
        }

        return undefined;
      }
    }
  );

  if (error)
    return <ErrorPage statusCode={error.statusCode} title={error.message} />;

  if (!entry) return null;

  const description = entry.description;

  return (
    <>
      <Head>
        <title>{entry.title}</title>
      </Head>
      <Box width={{ max: "65ch" }} margin="0 auto" pad="small">
        <Heading margin={{ bottom: "12px" }}>{entry.title}</Heading>
        <Markdown>{description}</Markdown>
        <Fab>
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
