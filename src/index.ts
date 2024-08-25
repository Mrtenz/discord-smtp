import { createServer } from './server.js';
import { getLogger, getNumberEnvironmentVariable } from './environment.js';

const port = getNumberEnvironmentVariable('SMTP_PORT');

const server = createServer();
server.listen(port);

const log = getLogger();
log.info(`SMTP server listening on port ${port}.`);

process.on('SIGINT', () => {
  log.debug('Received SIGINT.');
  server.close(() => {
    log.info('SMTP server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log.debug('Received SIGTERM.');
  server.close(() => {
    log.info('SMTP server closed.');
    process.exit(0);
  });
});
