import { AppProps } from "next/app";
import Router from "next/router";
import { UserProvider } from "@auth0/nextjs-auth0";
import { Grommet } from "grommet";
import nprogress from "nprogress";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { TopBar, Container, Application } from "components/Layout";

import { useConstant } from "hooks/useConstant";
import { theme } from "styles/theme";
import { GlobalStyle } from "styles/global";

nprogress.configure({
  showSpinner: false,
  parent: "#content"
});

Router.events.on("routeChangeStart", () => nprogress.start());
Router.events.on("routeChangeComplete", () => nprogress.done());
Router.events.on("routeChangeError", () => nprogress.done());

export default function App({ Component, pageProps }: AppProps) {
  const client = useConstant(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <Grommet theme={theme}>
        <GlobalStyle />
        <UserProvider>
          <TopBar />
          <Container id="content">
            <Application>
              <Component {...pageProps} />
            </Application>
          </Container>
        </UserProvider>
      </Grommet>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
