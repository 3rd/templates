FROM alpine:latest

RUN apk add --no-cache unzip openssh libc6-compat

COPY ./bin/server-alpine /app/server
WORKDIR /app

EXPOSE 8090
CMD ["/app/server", "serve", "--http=[::]:8090"]
