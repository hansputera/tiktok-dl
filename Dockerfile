FROM rust:1-alpine AS native
RUN apk add --no-cache build-base cmake perl
COPY packages/core/native/core-rs /src
RUN cd /src && cargo build --release

FROM node:22-alpine3.22
RUN apk add --no-cache libgcc libstdc++ && apk update
WORKDIR /home/tiktok-dl
COPY . .
COPY --from=native /src/target/release/libcore_rs.so packages/core/native/core-rs/core_rs.node
ENV CORE_RS_PREBUILT=1
RUN yarn install && yarn build
EXPOSE 3000
CMD ["yarn", "start"]
