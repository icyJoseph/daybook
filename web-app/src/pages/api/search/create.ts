import { NextApiRequest, NextApiResponse } from "next";

import { withAccessToken } from "utils/withAccessToken";

import auth0 from "utils/auth0";

async function create(
  req: NextApiRequest,
  res: NextApiResponse,
  token: string
) {
  const current = req.body;

  const { id: omit, created_at: omit2, ...rest } = current;

  const response = await fetch(`${process.env.PROXY_URL}/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(rest)
  });

  if (!response.ok) {
    return res.status(404).json({ message: "Not found" });
  }

  const data = await response.json();

  return res.json(data);
}

export default auth0.withApiAuthRequired(withAccessToken(create, "POST"));
