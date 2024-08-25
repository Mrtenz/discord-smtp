FROM node:lts-slim

MAINTAINER Maarten Zuidhoorn <maarten@zuidhoorn.com>

ENV NODE_ENV production
ENV SMTP_LOG_LEVEL info
ENV SMTP_PORT 587
ENV SMTP_ENABLE_TLS true

USER node
WORKDIR /app

COPY --chown=node .yarn .yarn
COPY --chown=node package.json yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY --chown=node src src
COPY --chown=node tsconfig.json ./
RUN yarn build

# Install only production dependencies
RUN yarn plugin remove @yarnpkg/plugin-allow-scripts
RUN yarn workspaces focus --production
RUN yarn cache clean

EXPOSE $PORT

ENTRYPOINT ["node"]
CMD ["dist/index.js"]
