export type Entry = {
  id: string;
  title: string;
  description: string;
  created_at: number;
  tags: string[];
  privacy?: boolean;
  links?: string[];
};

export type DayBook = Record<string, Entry[]>;
