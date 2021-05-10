import Head from "next/head";
import { withPageAuthRequired, UserProfile } from "@auth0/nextjs-auth0";
import { useRef, FormEvent } from "react";

export default function Profile({ user }: { user: UserProfile }) {
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const title = (titleRef.current?.value ?? "").trim();
    const description = (descriptionRef.current?.value ?? "").trim();

    if (title && description) {
      fetch("/api/search/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description })
      });
    }
  };
  return (
    <>
      <Head>
        <title>Create</title>
      </Head>
      <div>
        <h1>Hello {user.name}</h1>
        <form onSubmit={handleSubmit}>
          <input name="title" ref={titleRef} />
          <textarea name="description" ref={descriptionRef} />
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired();
