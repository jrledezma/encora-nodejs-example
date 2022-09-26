#building app
FROM node as builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#setting up
FROM node:12.16.1 
RUN apt-get update && apt-get install -y bash vim telnet mtr-tiny dnsutils
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/app/dist ./dist

CMD node dist/server.js
