import { NextApiRequest, NextApiResponse } from "next";

import { withAccessToken } from "utils/withAccessToken";

import auth0 from "utils/auth0";

async function edit(req: NextApiRequest, res: NextApiResponse, token: string) {
  const { next, current } = req.body;

  const { id: omit, create_at: omit2, ...nextRest } = next;

  if (!current.id) return res.status(500).json({ statusCode: 500 });

  const update = { ...current, ...nextRest };

  const response = await fetch(`${process.env.PROXY_URL}/edit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(update)
  });

  if (!response.ok) {
    return res.status(404).json({ message: "Not found" });
  }

  const data = await response.json();

  return res.json(data);
}

export default auth0.withApiAuthRequired(withAccessToken(edit, "POST"));
