import { NextApiRequest, NextApiResponse } from "next";

import { withAccessToken } from "utils/withAccessToken";

import auth0 from "utils/auth0";

async function create(
  req: NextApiRequest,
  res: NextApiResponse,
  token: string
) {

  const response = await fetch(`${process.env.PROXY_URL}/recreate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  });

  if (!response.ok) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json({ status: response.status });
}

export default auth0.withApiAuthRequired(withAccessToken(create, "POST"));
