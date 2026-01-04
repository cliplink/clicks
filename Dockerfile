# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./

RUN --mount=type=secret,id=npm_token \
    echo "@cliplink:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npm_token)" >> .npmrc && \
    if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev; \
    else \
      npm install; \
    fi && \
    rm -f .npmrc

COPY . .

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then node dist/main.js; else npm run start:dev; fi"]