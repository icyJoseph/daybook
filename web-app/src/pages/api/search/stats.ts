import { NextApiRequest, NextApiResponse } from "next";
import { AccessTokenError } from "@auth0/nextjs-auth0/dist/utils/errors";

import auth0 from "utils/auth0";

async function stats(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(401).json({ statusCode: 401 });

  try {
    const session = await auth0.getAccessToken(req, res);

    if (!session) return res.status(401).json({ statusCode: 401 });

    const { accessToken } = session;

    if (!accessToken) return res.status(401).json({ statusCode: 401 });

    const data = await fetch(`${process.env.PROXY_URL}/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then((res) => res.json());

    return res.json(data);
  } catch (err) {
    if (err instanceof AccessTokenError) {
      if (err.code === "access_token_expired") {
        res.statusCode = 301;
        res.redirect("/api/auth/logout").end();
        return;
      }
    } else {
      return res.status(500).json({ statusCode: 500 });
    }
  }
}

export default auth0.withApiAuthRequired(stats);
