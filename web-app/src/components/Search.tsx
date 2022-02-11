import {
  ComponentPropsWithoutRef,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useRouter } from "next/router";
import { Box, Button, Text, TextInput } from "@mantine/core";

import { Entry } from "interfaces/entry";
import { EntryCard } from "components/EntryCard";
import { Result } from "interfaces/result";
import { useStats } from "hooks/useStats";

const SearchForm = (props: ComponentPropsWithoutRef<"form">) => (
  <Box
    component="form"
    {...props}
    sx={(theme) => ({
      position: "sticky",
      top: 0,
      padding: "1rem 2rem",
      background: "white",
      boxShadow: theme.shadows.sm,
      zIndex: 2,
      isolation: "isolate"
    })}
  />
);

const defaultResult: Result<Entry> = Object.freeze({
  hits: [],
  processing_time_ms: null,
  offset: 0,
  limit: 0,
  nb_hits: 0,
  exhaustive_nb_hits: false
});

export const Search = ({ q = "" }: { q?: string | string[] }) => {
  const [{ hits, processing_time_ms: searchTime }, setResults] = useState({
    ...defaultResult
  });

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useStats();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (q) {
      const urlQuery = Array.isArray(q) ? q.join(" ") : q;

      if (inputRef.current) {
        inputRef.current.value = urlQuery;
      }

      const controller = new AbortController();
      const signal = controller.signal;

      fetch(`/api/search/query?q=${urlQuery}`, { signal })
        .then(async (res) => {
          const data = await res.json();
          if (res.status === 200) {
            return data;
          } else {
            throw data;
          }
        })
        .then((data) => setResults(data))
        .catch(() => setResults({ ...defaultResult }));

      return () => controller.abort();
    } else {
      setResults({ ...defaultResult });
    }
  }, [q]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value?.trim();
    if (query) {
      router.push({ pathname: "/", query: { q: query } });
      try {
        const res = await fetch(`/api/search/query?q=${query}`);
        const data = await res.json();

        if (res.status !== 200) {
          throw data;
        }

        setResults(data);
      } catch (err) {
        setResults({ ...defaultResult });
      }
    } else {
      router.push("/");
      setResults({ ...defaultResult });
    }
  };

  const numberOfDocuments = data?.number_of_documents ?? 0;
  const label = useMemo(
    () => (
      <Text component="span" sx={{ fontWeight: 300 }}>
        Ready to search across{" "}
        <Text component="span" color="blue" size="lg">
          {numberOfDocuments}
        </Text>{" "}
        documents
      </Text>
    ),
    [data]
  );

  return (
    <>
      <SearchForm onSubmit={onSubmit}>
        <Box>
          <TextInput
            label={label}
            placeholder="What are you looking for?"
            ref={inputRef}
            size="md"
          />

          <Button type="submit" mt="md">
            Search
          </Button>

          {searchTime !== null && (
            <Text
              component="p"
              color="dark-3"
              size="md"
              mt="md"
              sx={{ fontWeight: 300 }}
            >
              Search time:{" "}
              <Text component="span" color="blue">
                {searchTime} ms
              </Text>{" "}
              /{" "}
              <Text component="span" color="blue">
                {hits.length} results
              </Text>
            </Text>
          )}
        </Box>
      </SearchForm>

      {hits.length > 0 && (
        <ul>
          {hits.map((item) => (
            <EntryCard key={item.id} {...item} preview />
          ))}
        </ul>
      )}
    </>
  );
};
