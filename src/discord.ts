import { getLogger } from './environment.js';

const log = getLogger();

/**
 * Get the Discord webhook URL for the given username and password.
 *
 * @param username - The username.
 * @param password - The password.
 * @returns The Discord webhook URL.
 */
export function getWebhookUrl(username?: string, password?: string) {
  if (!username) {
    throw new Error('Username is required, but was not provided.');
  }

  if (!password) {
    throw new Error('Password is required, but was not provided.');
  }

  return `https://discord.com/api/webhooks/${username}/${password}`;
}

/**
 * Attempt to parse a fetch response as JSON, and return the plain text message
 * if it fails.
 *
 * @param response - The fetch response to parse.
 * @returns The response message.
 */
async function getResponseMessage(response: Response) {
  try {
    const json = await response.json();
    return json.message ?? JSON.stringify(json, null, 2);
  } catch {
    return await response.text();
  }
}

/**
 * Send a message to a Discord webhook.
 *
 * @param webhookUrl - The URL of the Discord webhook.
 * @param sender - The sender of the message.
 * @param subject - The subject of the message.
 * @param message - The message content.
 * @throws If the request fails.
 */
export async function sendDiscordMessage(
  webhookUrl: string,
  sender?: string,
  subject?: string,
  message?: string,
) {
  const body = {
    embeds: [
      {
        title: subject,
        description: message,
        footer: {
          text: sender,
        },
      },
    ],
  };

  log.debug(`Sending Discord message to "${webhookUrl}".`);
  log.debug(JSON.stringify(body, null, 2));

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await getResponseMessage(response);
    const error = `Failed to send Discord message: ${response.status} ${response.statusText}. The message returned by Discord was: "${message}".`;

    log.error(error);
    throw new Error(error);
  }
}
