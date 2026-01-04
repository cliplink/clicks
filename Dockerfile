FROM node:20-alpine

WORKDIR /app

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

ARG CLIPLINK_PACKAGES_TOKEN
ENV CLIPLINK_PACKAGES_TOKEN=${CLIPLINK_PACKAGES_TOKEN}

COPY .npmrc ./
COPY package*.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build

RUN if [ "$NODE_ENV" = "production" ]; then npm prune --production; fi

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then node dist/main.js; else npm run start:dev; fi"]