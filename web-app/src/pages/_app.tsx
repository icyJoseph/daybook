import { AppProps } from "next/app";
import Router from "next/router";
import { UserProvider } from "@auth0/nextjs-auth0";
import { Grommet } from "grommet";
import nprogress from "nprogress";

import { TopBar, Container, Application } from "components/Layout";

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
  return (
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
  );
}
