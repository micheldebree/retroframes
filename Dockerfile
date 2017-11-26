# Run retroframes
FROM node:6.11.0-alpine
MAINTAINER michel@michdeldebree.nl
RUN apk upgrade -U \
 && apk add ca-certificates ffmpeg \
 && rm -rf /var/cache/*
COPY . /retroframes/
RUN mkdir -p /data
WORKDIR /data
ENTRYPOINT ["node", "/retroframes/index.js"]
