import type { NextApiRequest, NextApiResponse } from "next";
import { AccessTokenError } from "@auth0/nextjs-auth0/dist/utils/errors";

import auth0 from "utils/auth0";

type Handler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  token: string
) => Promise<T>;

export const withAccessToken =
  <T>(handler: Handler<T>, method: string) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    // expected method differs from received
    if (req.method !== method)
      return res.status(400).json({ message: "Bad request" });

    try {
      const session = await auth0.getAccessToken(req, res);

      if (!session) return res.status(401).json({ message: "Missing session" });

      const { accessToken } = session;

      if (!accessToken)
        return res.status(401).json({ message: "Missing access token" });

      return handler(req, res, accessToken);
    } catch (err) {
      console.log(err);

      if (err instanceof AccessTokenError) {
        if (err.code === "access_token_expired") {
          return res.redirect(307, "/api/auth/logout").end();
        }
      }

      return res.status(500).json({ message: "Unexpected Error" });
    }
  };
