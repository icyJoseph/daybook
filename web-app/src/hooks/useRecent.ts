import { useInfiniteQuery } from "react-query";

import type { Entry } from "interfaces/entry";
import type { Result } from "interfaces/result";

export const useRecent = () => {
  return useInfiniteQuery<Result<Entry>>(
    "recent",
    async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/search/infinite?from=${pageParam}`);

      if (!res.ok) throw res;

      const data = await res.json();

      return data;
    },
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage) return;

        if (lastPage.offset + lastPage.hits.length >= lastPage.nb_hits) return;

        return Math.floor(lastPage.offset / lastPage.limit) + 1;
      },
    }
  );
};
