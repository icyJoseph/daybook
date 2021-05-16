import { useQuery } from "react-query";

import { Entry } from "interfaces/entry";
import { Result } from "interfaces/result";
import { daysAgoInSecs } from "utils/recent";

export const useRecent = (days = 7) => {
  return useQuery<Result<Entry>>(["recent", days], async () => {
    const date = daysAgoInSecs(days);
    const res = await fetch(`/api/search/later_than?created_at=${date}`);

    if (!res.ok) throw res;

    const data = await res.json();

    return data;
  });
};
