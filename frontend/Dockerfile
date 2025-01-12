FROM node:20-alpine

WORKDIR /frontend

COPY ./package.json ./package-lock.json /frontend/
RUN npm install
COPY . ./
#RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
