FROM node:12

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

RUN yarn global add typescript
RUN yarn global add ts-node

RUN yarn 

RUN tsc

# Bundle app source
COPY . /usr/src/app

CMD ./dist/bin/yahweh.js

