FROM node:14-alpine

RUN adduser -D appuser
USER appuser

RUN mkdir -p /home/appuser/app
WORKDIR /home/appuser/app

COPY package.json package-lock.json /home/appuser/app/
RUN npm install --production

COPY . .

CMD ["node", "server.js"]
EXPOSE 4000