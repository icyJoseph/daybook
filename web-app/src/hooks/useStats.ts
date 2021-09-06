import { useQuery } from "react-query";

type Stats = {
  number_of_documents: number;
  is_indexing: boolean;
};

export const useStats = (hasUser = false) => {
  return useQuery<Stats>(
    "stats",
    () => fetch("/api/search/stats").then((res) => res.json()),
    { refetchOnWindowFocus: true, enabled: hasUser }
  );
};
