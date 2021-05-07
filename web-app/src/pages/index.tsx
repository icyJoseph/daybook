import { useUser } from "@auth0/nextjs-auth0";
import { useRef, useState } from "react";
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
              `/api/search/query?term=${query}`
            ).then((res) => res.json());

            if ("hits" in data) {
              setItems(data.hits);
            }
            if ("processing_time_ms" in data) {
              setSearchTime(data.processing_time_ms);
            }
          }
        }}
      >
        <input ref={inputRef}></input>
        <button>Search</button>
      </form>
      {searchTime === null ? null : <span>Search time: {searchTime} ms</span>}
      <ul>
        {items.map((item) => {
          const date = new Date(item.day).toLocaleDateString();
          
          return (
            <li key={item.id}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <time dateTime={date}>{date}</time>
            </li>
          );
        })}
      </ul>
    </>
  );
};

const IndexPage = () => {
  const { user, error, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <>
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
