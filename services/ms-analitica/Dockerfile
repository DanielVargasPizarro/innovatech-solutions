FROM node:18-alpine

# Instalar compatibilidad nativa para los binarios de Prisma en entornos Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generar el cliente de Prisma adaptado al contenedor Alpine
RUN npx prisma generate

EXPOSE 3003

CMD ["node", "src/index.js"]