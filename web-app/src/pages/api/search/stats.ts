import { NextApiRequest, NextApiResponse } from "next";

import { withAccessToken } from "utils/withAccessToken";

import auth0 from "utils/auth0";

async function stats(_: NextApiRequest, res: NextApiResponse, token: string) {
  const response = await fetch(`${process.env.PROXY_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    return res.status(404).json({ message: "Not found" });
  }

  const data = await response.json();

  return res.json(data);
}

export default auth0.withApiAuthRequired(withAccessToken(stats, "GET"));
