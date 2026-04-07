FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install

COPY . .

RUN npm run build --prefix frontend

ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/ecoaura.db

EXPOSE 8080

CMD ["npm", "run", "start"]
