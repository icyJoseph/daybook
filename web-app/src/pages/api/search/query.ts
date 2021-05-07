import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

async function search(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(401).json({ statusCode: 401 });

  const session = await getAccessToken(req, res);

  if (!session) return res.status(401).json({ statusCode: 401 });

  const { accessToken } = session;

  const { query } = req;

  try {
    const data = await fetch(
      `${process.env.PROXY_URL}/search?query=${query.term}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    ).then((res) => res.json());

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ statusCode: 500 });
  }
}

export default withApiAuthRequired(search);
