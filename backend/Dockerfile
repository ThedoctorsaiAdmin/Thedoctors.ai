FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc --skipLibCheck || true
EXPOSE 4000
CMD ["node", "dist/index.js"]
