import { initAuth0 } from "@auth0/nextjs-auth0";

export default initAuth0({
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.VERCEL_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});
