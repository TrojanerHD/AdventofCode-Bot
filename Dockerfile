FROM node:24-alpine
COPY --from=ghcr.io/pnpm/pnpm:12-alpine /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done

# create and set workdir
WORKDIR /usr/src/trojaner

# install dependencies 
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --allow-build sqlite3@5.1.7

# copy bot to work dir
COPY . ./

RUN pnpm compile

# main command
CMD ["node", "build/index.js"]
