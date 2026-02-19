FROM node:22-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
# When NODE_ENV=production, npm automatically skips devDependencies
RUN npm install --loglevel=error

# Copy application code
COPY . .

# Expose the correct port (matches PORT=3000 in .env.example)
EXPOSE 3000

CMD [ "node", "src/index.js" ]