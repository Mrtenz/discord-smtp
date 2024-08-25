import {
  SMTPServer,
  SMTPServerAuthentication,
  SMTPServerAuthenticationResponse,
  SMTPServerDataStream,
  SMTPServerSession,
} from 'smtp-server';
import { simpleParser as parse } from 'mailparser';
import { getWebhookUrl, sendDiscordMessage } from './discord.js';
import { getEnvironmentVariable, getLogger } from './environment.js';

const log = getLogger();

/**
 * Read the data from a stream and return it as a string.
 *
 * @param stream - The stream to read.
 * @returns The data from the stream as a string.
 */
async function getStreamData(stream: SMTPServerDataStream) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Get the email address from the SMTP session.
 *
 * @param session - The SMTP session information.
 * @returns The email address, or `undefined` if it is not available.
 */
function getMailFrom(session: SMTPServerSession) {
  if (session.envelope.mailFrom) {
    return session.envelope.mailFrom.address;
  }

  return undefined;
}

/**
 * Handle the data event for an incoming email.
 *
 * @param stream - The stream containing the email data.
 * @param session - The SMTP session information.
 */
export async function onData(
  stream: SMTPServerDataStream,
  session: SMTPServerSession,
) {
  if (!session.user) {
    const error = 'Received an email, but the sender is unknown.';
    log.error(error);

    throw new Error(error);
  }

  const sender = getMailFrom(session);
  log.debug(`Received email from ${sender}.`);

  const message = await getStreamData(stream);
  log.debug(message);

  const parsedMessage = await parse(message, {
    skipTextToHtml: true,
  });

  log.debug(
    `Parsed email with subject: "${parsedMessage.subject ?? 'no subject'}".`,
  );

  await sendDiscordMessage(
    session.user,
    getMailFrom(session),
    parsedMessage.subject,
    parsedMessage.text,
  );
}

/**
 * Create an SMTP server that forwards incoming emails to Discord webhooks.
 *
 * @returns The SMTP server.
 */
export function createServer() {
  const secure = Boolean(getEnvironmentVariable('SMTP_ENABLE_TLS', 'true'));
  const server = new SMTPServer({
    authOptional: false,
    allowInsecureAuth: !secure,
    authMethods: ['PLAIN', 'LOGIN'],

    onConnect(
      session: SMTPServerSession,
      callback: (err?: Error | null) => void,
    ) {
      log.debug(`Connection established from "${session.remoteAddress}".`);
      callback();
    },

    onClose(session: SMTPServerSession) {
      log.debug(`Connection closed from "${session.remoteAddress}".`);
    },

    onAuth(
      auth: SMTPServerAuthentication,
      session: SMTPServerSession,
      callback: (
        err: Error | null | undefined,
        response?: SMTPServerAuthenticationResponse,
      ) => void,
    ) {
      log.debug(`Received authentication request for user "${auth.username}".`);

      try {
        const webhookUrl = getWebhookUrl(auth.username, auth.password);
        callback(null, { user: webhookUrl });

        log.debug(`Authenticated user "${auth.username}".`);
      } catch (error) {
        log.error(error);
        callback(error as Error);
      }
    },

    onData(
      stream: SMTPServerDataStream,
      session: SMTPServerSession,
      callback: (error?: Error | null) => void,
    ) {
      onData(stream, session)
        .then(() => callback())
        .catch(callback);
    },
  });

  server.on('error', (error) => {
    log.error('An error occurred in the SMTP server:', error);
  });

  return server;
}
