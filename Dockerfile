FROM node:current-alpine3.15

RUN apk update

# Prepare
RUN mkdir -p /home/tiktok-dl
COPY . /home/tiktok-dl
WORKDIR /home/tiktok-dl

# Build
RUN yarn install
RUN yarn build

# Expose port
EXPOSE 3000

CMD ["yarn", "start"]