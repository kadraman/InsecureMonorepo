FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../packages ./packages

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Vulnerability: Running as root user
# Vulnerability: Exposing internal port
EXPOSE 3001

# Vulnerability: No health check
CMD ["npm", "start"]
