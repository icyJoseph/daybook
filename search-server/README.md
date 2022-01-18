# Proxy Server

Actix-web server to connect privately to the MeilieSearch instance.

## Trade-off

Because the data in the MeilieSearch database is meant to be private, connecting to it is limited
by this actix-web server, which verifies Auth0's access tokens.

This means that any search attempt is authenticated, and therefore slower than regular MeilieSearch.

## Setting up as a linux service

1. Create service file

```bash
sudo vim /etc/systemd/system/daybook.service
```

2. Fill in with these contents:

```
[Unit]
Description=Daybook
After=network.target

[Service]
EnvironmentFile= <Path to env file>
Type=simple
ExecStart= <Path to executable>

[Install]
WantedBy=multi-user.target
```

3. Enable the service

```
sudo systemctl enable daybook
```

4. Start the service

```
sudo systemctl start daybook
```

5. Check its status

```
sudo systemctl status daybook
```

6. Check it with journalctl

```
sudo journalctl -u daybook.service
```

### Environment variables for the linux service

Make sure to have defined `.env` correctly. It should have these key-value pairs.

```
ACTIX_SERVER_URL= <ACTIX_SERVER_WITH_PORT>
AUTH0_ISSUER_BASE_URL= <AUTH0_URL>
MEILI_MASTER_KEY= <MASTER_KEY>
MEILI_BASE_URL= <SOME_URL>
INDEX_NAME= <INDEX_NAME>
MEILI_ENV= <DEV_MODE>
MEILI_PATH= <PATH_TO_MS_INSTANCE>
MEILI_DB_PATH= <PATH_TO_MS_DB>
```
