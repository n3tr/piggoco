FROM node:16-alpine AS appbuild

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY ./src ./src
COPY ./prisma ./prisma
COPY tsconfig.json ./tsconfig.json

RUN npm run build

ENV PORT 8080
EXPOSE 8080

ENTRYPOINT ["npm","start"]
