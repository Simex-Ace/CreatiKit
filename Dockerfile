# Use an official Node.js runtime as a parent image
FROM node:18.20.8

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN apt-get update && \
    apt-get install -y libvips-dev && \
    npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Command to run the application
CMD ["npm", "start"]