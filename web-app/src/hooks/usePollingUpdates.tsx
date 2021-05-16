import { Fragment } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Update } from "interfaces/update";

const useUpdates = () => {
  return useQuery<Update[]>("updates", () => {
    return [];
  });
};

const Poll = ({ update }: { update: Update }) => {
  const client = useQueryClient();
  const { update_id } = update;

  useQuery<Update>(
    ["update", update_id],
    () =>
      fetch(`/api/search/check_update?update_id=${update_id}`).then((res) =>
        res.json()
      ),
    {
      staleTime: 250,
      onSuccess: async (data) => {
        const { state } = data;
        switch (state) {
          case "failed":
          case "done": {
            client.setQueryData<Update[]>("updates", (prev = []) =>
              prev.filter((val) => val.update_id !== update_id)
            );

            return await client.invalidateQueries("recent");
          }
          default:
            return;
        }
      }
    }
  );

  return null;
};

export const PollingUpdates = () => {
  const updates = useUpdates();

  return (
    <Fragment>
      {(updates.data ?? []).map((update) => (
        <Poll key={update.update_id} update={update} />
      ))}
    </Fragment>
  );
};
