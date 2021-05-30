import { FormEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { Button, Box, Text, TextInput, Form, FormField } from "grommet";

import { Entry } from "interfaces/entry";
import { EntryCard } from "components/EntryCard";
import { Result } from "interfaces/result";

const SearchForm = styled(Form)`
  position: sticky;
  top: 0;
  padding: 1rem 2rem;

  background: white;
  box-shadow: ${({ theme }) => theme.global?.elevation?.light?.small};
`;

const defaultResult: Result<Entry> = {
  hits: [],
  processing_time_ms: 0,
  offset: 0,
  limit: 0,
  nb_hits: 0,
  exhaustive_nb_hits: false
};

export const Search = ({ q = "" }: { q?: string | string[] }) => {
  const [{ hits, processing_time_ms: searchTime }, setResults] = useState({
    ...defaultResult
  });

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (q) {
      const urlQuery = Array.isArray(q) ? q.join(" ") : q;

      if (inputRef.current) {
        inputRef.current.value = urlQuery;
      }

      const controller = new AbortController();
      const signal = controller.signal;
      
      fetch(`/api/search/query?q=${urlQuery}`, { signal })
        .then((res) => res.json())
        .then((data) => setResults(data));

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
        const data = await fetch(`/api/search/query?q=${query}`).then((res) =>
          res.json()
        );

        setResults(data);
      } catch (e) {
        setResults({ ...defaultResult });
      }
    } else {
      router.push("/");
      setResults({ ...defaultResult });
    }
  };

  return (
    <>
      <SearchForm onSubmit={onSubmit}>
        <FormField contentProps={{ width: { max: "45ch" }, margin: "0 auto" }}>
          <TextInput
            placeholder="What are you looking for?"
            ref={inputRef}
          ></TextInput>
        </FormField>
        <Box align="center" gap="medium">
          <Button type="submit" primary label="Search" />
          {searchTime === null ? null : (
            <Text color="dark-3">Search time: {searchTime} ms</Text>
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
