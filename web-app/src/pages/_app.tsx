import { UserProvider } from "@auth0/nextjs-auth0";
import type { AppProps } from "next/app";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <nav>
        <Link href="/">
          <a style={{ marginRight: "8px" }}>Home</a>
        </Link>
        <Link href="/create">
          <a>Create</a>
        </Link>
      </nav>
      <Component {...pageProps} />
    </UserProvider>
  );
}
