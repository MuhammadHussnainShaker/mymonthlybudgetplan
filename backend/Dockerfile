FROM node:22-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

COPY package*.json ./

# Use npm ci with --omit=dev for production installs
RUN npm ci --omit=dev

COPY . .

# Expose the correct port (PORT env var in .env.example is 3000)
EXPOSE 3000

CMD [ "node", "src/index.js" ]