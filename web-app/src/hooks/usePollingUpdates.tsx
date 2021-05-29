import { Fragment } from "react";
import { useQuery, useQueryClient, QueryKey } from "react-query";
import { Update } from "interfaces/update";

type Invalidate = {
  key?: QueryKey;
};

const useUpdates = () => {
  return useQuery<Update[]>("updates", () => {
    return [];
  });
};

export type PollingUpdate = Update & Invalidate;

export const isUpdate = (obj: any): obj is Update => {
  return "state" in obj && "update_id" in obj;
};

const Poll = ({ update }: { update: PollingUpdate }) => {
  const client = useQueryClient();
  const { update_id } = update;

  useQuery<PollingUpdate>(
    ["update", update_id],
    () =>
      fetch(`/api/search/check_update?update_id=${update_id}`).then((res) =>
        res.json()
      ),
    {
      refetchInterval: 250,
      onSuccess: async (data) => {
        const { state } = data;
        switch (state) {
          case "failed":
          case "done": {
            client.setQueryData<PollingUpdate[]>("updates", (prev = []) =>
              prev.filter((val) => val.update_id !== update_id)
            );

            if (update.key) {
              return await client.invalidateQueries(update.key);
            }
            return;
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
