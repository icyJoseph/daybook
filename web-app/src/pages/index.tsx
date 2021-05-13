import { useRef, useState } from "react";
import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0";

import { Button, Box, Text, TextInput, Form, FormField } from "grommet";

import { Entry } from "interfaces/entry";
import { EntryCard } from "components/EntryCard";

const Search = () => {
  const [items, setItems] = useState<Entry[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          const query = inputRef.current?.value?.trim();
          if (query) {
            try {
              const data = await fetch(`/api/search/query?q=${query}`).then(
                (res) => res.json()
              );

              if ("hits" in data) {
                setItems(data.hits);
              }
              if ("processing_time_ms" in data) {
                setSearchTime(data.processing_time_ms);
              }
            } catch (e) {
              setItems([]);
              setSearchTime(0);
            }
          } else {
            setItems([]);
            setSearchTime(0);
          }
        }}
        style={{ position: "sticky", top: 0, background: "white" }}
      >
        <FormField>
          <TextInput
            placeholder="What are you looking for?"
            ref={inputRef}
          ></TextInput>
        </FormField>
        <Box align="center" gap="medium">
          <Button type="submit" primary label="Search" />
        </Box>
        {searchTime === null ? null : (
          <Text margin={{ top: "8px" }}>Search time: {searchTime} ms</Text>
        )}
      </Form>
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <EntryCard key={item.id} {...item} preview />
          ))}
        </ul>
      )}
    </>
  );
};

const IndexPage = () => {
  const { isLoading } = useUser();

  if (isLoading) return null;

  return (
    <>
      <Head>
        <title>Daybook</title>
      </Head>

      <Search />
    </>
  );
};

export default IndexPage;
