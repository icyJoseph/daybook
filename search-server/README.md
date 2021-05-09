# Proxy Server

Actix-web server to connect privately to the MeilieSearch instance.

## Trade-off

Because the data in the MeilieSearch database is meant to be private, connecting to it is limited
by this actix-web server, which verifies Auth0's access tokens.

This means that any search attempt is authenticated, and therefore slower than regular MeilieSearch.
