import { AppProps } from "next/app";
import Router from "next/router";
import Head from "next/head";

import { UserProvider } from "@auth0/nextjs-auth0";
import { MantineProvider } from "@mantine/core";
import { Grommet } from "grommet";
import nprogress from "nprogress";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { Application } from "components/Layout";

import { useConstant } from "hooks/useConstant";
import { theme } from "styles/theme";
import { GlobalStyle } from "styles/global";

nprogress.configure({
  showSpinner: false
});

Router.events.on("routeChangeStart", () => nprogress.start());
Router.events.on("routeChangeComplete", () => nprogress.done());
Router.events.on("routeChangeError", () => nprogress.done());

export default function App({ Component, pageProps }: AppProps) {
  const client = useConstant(() => new QueryClient());

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider withGlobalStyles withNormalizeCSS>
        <QueryClientProvider client={client}>
          <Grommet theme={theme}>
            <GlobalStyle />

            <UserProvider>
              <Application>
                <Component {...pageProps} />
              </Application>
            </UserProvider>
          </Grommet>

          <ReactQueryDevtools position="top-right" />
        </QueryClientProvider>
      </MantineProvider>
    </>
  );
}
