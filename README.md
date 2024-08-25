# `discord-smtp`

An SMTP server that forwards messages to a Discord webhook.

> [!NOTE]
>
> `discord-smtp` is intended for local network use only (e.g., inside a Docker
> or Kubernetes cluster).

## Installation

`discord-smtp` is available on Docker Hub:

```shell
docker pull mrtenz/discord-smtp
```

## Usage

To start the server, run the following command:

```shell
docker run -it --init -p 587:587 mrtenz/discord-smtp
```

This will start the server on port 587. You can then configure your email client
to use `localhost` as the SMTP server.

The server forwards messages to a Discord webhook. The webhook URL is configured
by setting the username and password to authenticate with the server. The
username should be the webhook ID, and the password should be the webhook token.

For example, if your webhook URL is
`https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz`, set
the username to `1234567890` and the password to `abcdefghijklmnopqrstuvwxyz`.

## Environment Variables

`discord-smtp` uses environment variables to allow the configuration of some
parameters at run time:

### `SMTP_PORT`

- **Default**: `587`

The port on which the SMTP server listens.

### `SMTP_ENABLE_TLS`

- **Default**: `true`

Whether to enable TLS for the server.

### `SMTP_LOG_LEVEL`

- **Default**: `info`
- **Accepted**: `trace`, `debug`, `info`, `warn`, `error`

The log level for the server.

### `NODE_ENV`

- **Default**: `production`

The environment in which the server is running. This may be used by Node.js
modules to determine whether to enable debugging or other development features.
It's not used by `discord-smtp` itself.
