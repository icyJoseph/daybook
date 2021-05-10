import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

async function bulk(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(401).json({ statusCode: 401 });

  try {
    const session = await getAccessToken(req, res);

    if (!session) return res.status(401).json({ statusCode: 401 });

    const { accessToken } = session;

    if (!accessToken) return res.status(401).json({ statusCode: 401 });

    const data = await fetch(`${process.env.PROXY_URL}/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    }).then((res) => res.json());

    return res.json(data);
  } catch (err) {
    if ("code" in err) {
      if (err.code === "access_token_expired") {
        res.statusCode = 301;
        res.redirect("/api/auth/logout");
      }
    } else {
      return res.status(500).json({ statusCode: 500 });
    }
  }
}

export default withApiAuthRequired(bulk);
