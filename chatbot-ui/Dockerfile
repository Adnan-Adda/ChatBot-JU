# Use a stable Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy environment variables (optional, only if needed during build)
COPY .env.local .env.local

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source code
COPY . .

# Set DNS fix for some alpine/docker setups
ENV NODE_OPTIONS=--dns-result-order=ipv4first

# Build the app
RUN npx next build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]