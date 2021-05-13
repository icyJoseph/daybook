import Head from "next/head";
import auth0 from "utils/auth0";
import { GetServerSidePropsContext } from "next";

import { Entry } from "interfaces/entry";

export default function EditEntry({ entry }: { entry: Entry }) {
  console.log(entry);
  return (
    <>
      <Head>
        <title>Edit</title>
      </Head>
      <div>
        <span>Edit</span>
      </div>
    </>
  );
}

export const getServerSideProps = auth0.withPageAuthRequired({
  getServerSideProps: async (context: GetServerSidePropsContext) => {
    const { id } = context.query;

    if (!id) return { redirect: { destination: "/", permanent: false } };

    try {
      const { accessToken } = await auth0.getAccessToken(
        context.req,
        context.res
      );

      const entry = await fetch(`${process.env.PROXY_URL}/entry/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }).then((res) => res.json());

      return { props: { entry } };
    } catch (err) {
      return { notFound: true };
    }
  }
});
