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

# Vulnerability: Running as root
# Vulnerability: Using old axios version with known vulnerabilities
EXPOSE 3003

CMD ["npm", "start"]
