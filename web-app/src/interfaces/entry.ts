export type Entry = {
  id: string;
  title: string;
  description: string;
  day: string;
  tags: string[];
  privacy?: boolean;
  links?: string[];
};

export type DayBook = Record<string, Entry[]>;
