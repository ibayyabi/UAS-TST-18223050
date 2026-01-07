# Use Node.js 23 Alpine image (matches package.json engine requirement roughly)
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
# Using npm ci for reliable builds
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
