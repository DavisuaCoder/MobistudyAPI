FROM node:11.12-alpine  as build

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package* /usr/src/app/

RUN npm install --production

COPY . /usr/src/app

FROM node:11.12-alpine

COPY --from=build /usr/src/app /usr/src/app

WORKDIR /usr/src/app
ENV WEB_PORT=8080
ENV NODE_ENV=production
CMD ["npm", "start"]

EXPOSE 8080
USER node
