
import { NextApiRequest, NextApiResponse } from "next";

import { withAccessToken } from "utils/withAccessToken";

import auth0 from "utils/auth0";

async function check_update(
  _: NextApiRequest,
  res: NextApiResponse,
  token: string
) {

  const response = await fetch(
    `${process.env.PROXY_URL}/config_filter_and_sort`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!response.ok) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json({ status: response.status });
}

export default auth0.withApiAuthRequired(withAccessToken(check_update, "GET"));
