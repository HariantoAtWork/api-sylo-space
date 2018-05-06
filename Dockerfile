FROM node:carbon-alpine

EXPOSE 3000

RUN apk update && apk upgrade
RUN apk --update add \
 git \
 bash \
 python \
 openssl \
 libgcc \
 make \
 libstdc++ \
 g++ \
 nano

RUN addgroup www-data \
 && adduser -h /home/node/app -s /bin/false -G www-data -D www-data \
 && npm install --global gulp

ENV NODE_ENV=production
ENV PORT=/tmp/api-sylo-space.sock
ENV HOME=/home/node
ENV NODE_WORKDIR=$HOME/app

COPY package*.json $NODE_WORKDIR/
RUN chown -R node:node $HOME

USER node
WORKDIR $NODE_WORKDIR
RUN npm install graceful-fs && npm install

USER root
COPY . $NODE_WORKDIR
RUN chown -R node:node /home/node

# USER node

CMD ["npm", "run", "docker"]
