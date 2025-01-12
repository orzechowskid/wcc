FROM node:buster-slim

WORKDIR /ml

COPY ./package.json ./package-lock.json /ml/
RUN npm install
COPY . ./

EXPOSE 8101

CMD [ "node", "src/index.js" ]
