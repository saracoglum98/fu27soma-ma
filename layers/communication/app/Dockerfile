FROM node:18

WORKDIR /application
COPY package*.json ./
RUN npm install -D @swc/core
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]