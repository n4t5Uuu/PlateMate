#Base Build Image
FROM node:18-alpine AS builder

WORKDIR /app

#install dependencies
COPY package*.json ./
RUN npm install

#copy source code and build
COPY . .
RUN npm run build

#Production Runtime Image
FROM node:18-alpine AS runner

WORKDIR /app

#copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]