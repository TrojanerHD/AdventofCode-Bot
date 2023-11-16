FROM node:lts-alpine

# create and set workdir
WORKDIR /usr/src/trojaner

# install dependencies 
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
RUN yarn global add typescript

# copy bot to work dir
COPY . ./

RUN yarn compile

# main command
CMD ["node", "build/index.js"]
