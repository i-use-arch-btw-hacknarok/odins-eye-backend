FROM node:21.7.1-alpine3.18 as base

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock


FROM base as modules

RUN yarn install --production=true --frozen-lockfile


FROM base as build

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate && yarn build && rm dist/tsconfig.build.tsbuildinfo


FROM base as release

COPY templates /app/templates
COPY prisma /app/prisma
COPY --from=build /app/dist /app/dist
COPY --from=modules /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

USER node

EXPOSE 3000
CMD [ "yarn", "start:prod" ]
