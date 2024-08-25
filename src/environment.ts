import log, { LogLevelDesc, LogLevelNames } from 'loglevel';

/**
 * Get the value of an environment variable. If the environment variable is not
 * set, the default value is used.
 *
 * @param name - The name of the environment variable.
 * @param defaultValue - The default value of the environment variable.
 * @returns The value of the environment variable.
 */
export function getEnvironmentVariable(
  name: string,
  defaultValue: string,
): string;

/**
 * Get the value of an environment variable. If a default value is provided, the
 * environment variable is optional. Otherwise, it is required, and an error is
 * thrown if it is not set.
 *
 * @param name - The name of the environment variable.
 * @param defaultValue - The default value of the environment variable.
 * @returns The value of the environment variable.
 */
export function getEnvironmentVariable(
  name: string,
  defaultValue?: string,
): string | undefined;

/**
 * Get the value of an environment variable. If a default value is provided, the
 * environment variable is optional. Otherwise, it is required, and an error is
 * thrown if it is not set.
 *
 * @param name - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws An error if the environment variable is not set.
 */
export function getEnvironmentVariable(
  name: string,
  defaultValue?: string,
): string | undefined {
  const value = process.env[name];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Required environment variable "${name}" is not set.`);
  }

  return value ?? defaultValue;
}

/**
 * Get the value of an environment variable as a number.
 *
 * @param name - The name of the environment variable.
 * @returns The value of the environment variable as a number.
 * @throws An error if the environment variable is not set or is not a number.
 */
export function getNumberEnvironmentVariable(name: string) {
  const value = getEnvironmentVariable(name);
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    throw new Error(`Environment variable "${name}" must be a number.`);
  }

  return numberValue;
}

/**
 * Check if a string is a valid log level.
 *
 * @param level - The log level to check.
 * @returns `true` if the log level is valid, otherwise `false`.
 */
function isLogLevel(level: string): level is LogLevelNames {
  return ['trace', 'debug', 'info', 'warn', 'error'].includes(level);
}

/**
 * Get the log level for the application.
 *
 * @returns The log level.
 */
function getLogLevel(): LogLevelDesc {
  const logLevel = getEnvironmentVariable('SMTP_LOG_LEVEL', 'info');
  if (!isLogLevel(logLevel)) {
    return 'info';
  }

  return logLevel;
}

/**
 * Get the logger for the application.
 *
 * @returns The logger.
 */
export function getLogger() {
  const logLevel = getLogLevel();
  log.setLevel(logLevel);

  return log;
}
