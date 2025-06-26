FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server.js ./

# If you want to include CORS etc.
RUN npm install express cors

EXPOSE 4000

CMD ["node", "server.js"]
