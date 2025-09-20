FROM node:22-alpine3.22

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