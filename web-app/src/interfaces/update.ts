export type Update = {
  state: "failed" | "processing" | "done";
  update_id: number;
};
