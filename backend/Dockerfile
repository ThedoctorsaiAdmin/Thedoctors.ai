FROM node:18-alpine
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc --skipLibCheck || true
EXPOSE 4000
CMD ["node", "dist/index.js"]
