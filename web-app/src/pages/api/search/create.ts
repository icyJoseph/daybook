import { NextApiRequest, NextApiResponse } from "next";
import { AccessTokenError } from "@auth0/nextjs-auth0/dist/utils/errors";

import auth0 from "utils/auth0";

async function bulk(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(400).json({ message: "Bad request" });

  try {
    const session = await auth0.getAccessToken(req, res);

    if (!session) return res.status(401).json({ message: "Missing session" });

    const { accessToken } = session;

    if (!accessToken)
      return res.status(401).json({ message: "Missing access token" });

    const current = req.body;

    const { id: omit, created_at: omit2, ...rest } = current;

    const response = await fetch(`${process.env.PROXY_URL}/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rest)
    });

    if (!response.ok) {
      return res.status(404).json({ message: "Not found" });
    }

    const data = await response.json();

    return res.json(data);
  } catch (err) {
    if (err instanceof AccessTokenError) {
      if (err.code === "access_token_expired") {
        res.redirect(307, "/api/auth/logout").end();
        return;
      }
    } else {
      return res.status(500).json({ message: "Unexpected Error" });
    }
  }
}

export default auth0.withApiAuthRequired(bulk);
