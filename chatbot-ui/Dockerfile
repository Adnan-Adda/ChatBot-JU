# Step 1: Use Node.js base image
FROM node:20-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Step 4: Copy rest of the project
COPY . .

# Step 5: Build the Next.js app
RUN npm run build

# Step 6: Expose port and run
EXPOSE 3000
CMD ["npm", "start"]