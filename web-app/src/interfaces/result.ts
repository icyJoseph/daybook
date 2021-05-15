export type Result<T> = {
  hits: Array<T>;
  processing_time_ms: number;
  offset: number;
  limit: number;
  nb_hits: number;
  exhaustive_nb_hits: boolean;
};
