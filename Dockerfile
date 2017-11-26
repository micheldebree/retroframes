# Run retroframes
FROM node:8.9-alpine
LABEL maintainer="michel@micheldebree.nl"
RUN apk upgrade -U \
 && apk add ca-certificates ffmpeg \
 && rm -rf /var/cache/*
COPY . /retroframes/
RUN mkdir -p /data
WORKDIR /data
ENTRYPOINT ["node", "/retroframes/index.js"]
