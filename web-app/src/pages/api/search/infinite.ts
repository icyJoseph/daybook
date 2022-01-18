import { NextApiRequest, NextApiResponse } from "next";

import { withAccessToken } from "utils/withAccessToken";
import auth0 from "utils/auth0";

async function infinite(
  req: NextApiRequest,
  res: NextApiResponse,
  token: string
) {
  const { query } = req;

  const limit = 20;
  const offset = Number(query.from) * limit;

  const response = await fetch(
    `${process.env.PROXY_URL}/infinite?offset=${offset}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) {
    return res.status(404).json({ message: "Not found" });
  }

  const data = await response.json();

  return res.json(data);
}

export default auth0.withApiAuthRequired(withAccessToken(infinite, "GET"));
