import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0";
import { Search } from "components/Search";
import { useRouter } from "next/router";

const IndexPage = () => {
  const { isLoading } = useUser();
  const { query } = useRouter();

  if (isLoading) return null;

  return (
    <>
      <Head>
        <title>Daybook</title>
      </Head>

      <Search q={query?.q} />
    </>
  );
};

export default IndexPage;
