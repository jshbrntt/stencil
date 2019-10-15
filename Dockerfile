FROM node:10.14.0-alpine

# Set working directory.
WORKDIR /usr/src

# Copying over project source..
COPY . ./

# Required to install dependencies.
ARG NPM_REGISTRY_URL

# Install as a global module.
RUN yarn -s build:npmrc \
 && yarn global add file:/usr/src || cat /usr/local/share/.config/yarn/global/yarn-error.log \
 && yarn cache clean \
 && mv docker-entrypoint.sh /usr/local/bin/ \
 && rm -rf /usr/src /root/.npmrc

# Exposing API ports.
EXPOSE 5000 50051

# Default command for running a Node.js module.
# https://docs.npmjs.com/cli/start
ENTRYPOINT [ "docker-entrypoint.sh" ]

CMD [ "http.server" ]
