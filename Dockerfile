FROM node:13.8.0-alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY tsconfig.json .
COPY src src
RUN npm run build

################################

FROM alpine

RUN apk add --update nodejs yarn && rm -rf /var/cache/apk

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --production --no-progress -s && rm -rf /tmp && rm -rf /usr/local/share/.cache/yarn

COPY --from=0 /app/dist .
CMD ["node", "index.js"]