FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc --skipLibCheck || true
EXPOSE 4000
CMD ["node", "dist/index.js"]
