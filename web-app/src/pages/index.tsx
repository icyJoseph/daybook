import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0";
import { Entry } from "../interfaces/entry";

const LoginControls = () => {
  const { user } = useUser();

  return (
    <ul>
      <li>
        {user ? (
          <a href="/api/auth/logout">Logout</a>
        ) : (
          <a href="/api/auth/login">Login</a>
        )}
      </li>
    </ul>
  );
};

const EntryCard = ({ created_at, title, description }: Entry) => {
  const date = new Date(created_at * 1000).toLocaleDateString();

  return (
    <li>
      <h2>{title}</h2>
      <p>{description}</p>
      <time dateTime={date}>{date}</time>
    </li>
  );
};

const useConstant = <T,>(init: () => T): T => {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = init();
  }

  return ref.current;
};

const LastWeek = ({
  updateSearchTime
}: {
  updateSearchTime: Dispatch<SetStateAction<number | null>>;
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  const date = useConstant(() => {
    const date = new Date();
    date.setDate(date.getDate() - 13);
    return Math.floor(date.getTime() / 1000);
  });

  useEffect(() => {
    fetch(`/api/search/later_than?created_at=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if ("hits" in data) {
          setEntries(data.hits);
        }
        if ("processing_time_ms" in data) {
          updateSearchTime(data.processing_time_ms);
        } else {
          setEntries([]);
        }
      });
  }, [date]);

  return (
    <>
      <h2>Last week</h2>
      <ul>
        {entries.map((entry) => (
          <EntryCard key={entry.id} {...entry} />
        ))}
      </ul>
    </>
  );
};

const Search = () => {
  const [items, setItems] = useState<Entry[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const query = inputRef.current?.value?.trim();
          if (query) {
            const data = await fetch(
              `/api/search/query?q=${query}`
            ).then((res) => res.json());

            if ("hits" in data) {
              setItems(data.hits);
            }
            if ("processing_time_ms" in data) {
              setSearchTime(data.processing_time_ms);
            }
          } else {
            setItems([]);
          }
        }}
      >
        <input ref={inputRef}></input>
        <button>Search</button>
      </form>
      {searchTime === null ? null : <span>Search time: {searchTime} ms</span>}
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <EntryCard key={item.id} {...item} />
          ))}
        </ul>
      ) : (
        <LastWeek updateSearchTime={setSearchTime} />
      )}
    </>
  );
};

const IndexPage = () => {
  const { user, error, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <>
      <Head>
        <title>Create</title>
      </Head>
      <header>
        <nav>
          <h1>Hi</h1>
          {!error ? <LoginControls /> : <span>{error.message}</span>}
        </nav>
      </header>
      <main>
        {user ? (
          <>
            <span>{user.name}</span>
            <Search />
          </>
        ) : (
          <span>no user</span>
        )}
      </main>
    </>
  );
};

export default IndexPage;
