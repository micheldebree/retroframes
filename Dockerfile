# Run retroframes
FROM node:8.15.1-alpine
LABEL maintainer="michel@micheldebree.nl"
RUN apk add --no-cache  ca-certificates=20171114-r3 ffmpeg=3.4.4-r1 \
 && rm -rf /var/cache/*
COPY /app/ /retroframes/
WORKDIR /retroframes
RUN yarn install
WORKDIR /data
ENTRYPOINT ["node", "/retroframes/index.js"]
