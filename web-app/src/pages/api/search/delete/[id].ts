import { NextApiRequest, NextApiResponse } from "next";

import { withAccessToken } from "utils/withAccessToken";

import auth0 from "utils/auth0";

async function deleteEntry(
  req: NextApiRequest,
  res: NextApiResponse,
  token: string
) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ message: "Bad request" });

  const response = await fetch(`${process.env.PROXY_URL}/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return res.status(404).json({ message: "Not found" });
  }

  const data = await response.json();

  return res.json(data);
}

export default auth0.withApiAuthRequired(
  withAccessToken(deleteEntry, "DELETE")
);
