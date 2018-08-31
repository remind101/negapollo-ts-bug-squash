FROM node:10.9.0
MAINTAINER Sophie Dawson <sophie@remind101.com>

RUN npm install -g yarn@1.9.4

RUN mkdir -p /home/app
WORKDIR /home/app

COPY package.json /home/app/
COPY yarn.lock /home/app/
# Omit --production until https://github.com/yarnpkg/yarn/issues/1462
RUN yarn install --frozen-lockfile --prefer-offline --no-progress

COPY . /home/app

RUN yarn build

EXPOSE 8080

CMD ["yarn", "prod"]
