import Head from "next/head";
import {
  withPageAuthRequired,
  UserProfile,
  getAccessToken
} from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";

import { Entry } from "../../interfaces/entry";

export default function DeleteEntry({
  user,
  entry
}: {
  user: UserProfile;
  entry: Entry;
}) {
  console.log(entry);
  return (
    <>
      <Head>
        <title>Delete</title>
      </Head>
      <div>
        <h1>Hello {user.name}</h1>
        <span>Delete</span>
      </div>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context: GetServerSidePropsContext) => {
    const { id } = context.query;

    if (!id) return { redirect: { destination: "/", permanent: false } };

    try {
      const { accessToken } = await getAccessToken(context.req, context.res);

      const entry = await fetch(`${process.env.PROXY_URL}/entry/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }).then((res) => res.json());

      return { props: { entry } };
    } catch (err) {
      return { notFound: true };
    }
  }
});
