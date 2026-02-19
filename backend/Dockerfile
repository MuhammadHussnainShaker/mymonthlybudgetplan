FROM node:22-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
# Note: Using npm install instead of npm ci due to npm ci timeout issues in some environments
# NODE_ENV=production ensures devDependencies are skipped
RUN npm install --loglevel=error

# Copy application code
COPY . .

# Expose the correct port (matches PORT=3000 in .env.example)
EXPOSE 3000

CMD [ "node", "src/index.js" ]