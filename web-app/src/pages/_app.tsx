import { UserProvider } from "@auth0/nextjs-auth0";
import type { AppProps } from "next/app";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style global jsx>{`
        a {
          margin-right: 8px;
        }
      `}</style>
      <UserProvider>
        <nav>
          <Link href="/">
            <a>Home</a>
          </Link>
          <Link href="/create">
            <a>Create</a>
          </Link>
        </nav>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
}
