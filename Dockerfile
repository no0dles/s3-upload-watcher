FROM node:alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY src src

CMD ["node_modules/.bin/ts-node", "./src/index"]