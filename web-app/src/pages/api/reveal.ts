import { NextApiRequest, NextApiResponse } from "next";
import { AccessTokenError } from "@auth0/nextjs-auth0/dist/utils/errors";

import { stegcloak } from "utils/cloak";
import auth0 from "utils/auth0";

async function reveal(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(401).json({ statusCode: 401 });

  try {
    const session = await auth0.getAccessToken(req, res);

    if (!session) return res.status(401).json({ statusCode: 401 });

    const { accessToken } = session;

    if (!accessToken) return res.status(401).json({ statusCode: 401 });

    const encrypted = req.body;

    const revealed = stegcloak.reveal(encrypted, process.env.STEGCLOAK_SECRET);

    return res.json({ revealed });
  } catch (err) {
    if (err instanceof AccessTokenError) {
      if (err.code === "access_token_expired") {
        res.statusCode = 301;
        res.redirect("/api/auth/logout");
      }
    } else {
      return res.status(500).json({ statusCode: 500 });
    }
  }
}

export default auth0.withApiAuthRequired(reveal);
