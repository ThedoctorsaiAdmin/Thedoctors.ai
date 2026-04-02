FROM node:18-slim
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc --skipLibCheck || true
EXPOSE 4000
CMD ["node", "dist/index.js"]
