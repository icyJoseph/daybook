export type Entry = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  privacy?: boolean;
  links?: string[];
};

export type DayBook = Record<string, Entry[]>;
