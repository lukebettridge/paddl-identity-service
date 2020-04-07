FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Create app directory
WORKDIR /home/node/app

COPY package.json ./
USER node

# Install app dependencies
RUN npm install

# Bundle app source
COPY --chown=node:node . .

# Test and build
RUN npm run test
RUN npm run build && npm prune --production

EXPOSE 8080
CMD npm start