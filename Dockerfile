# ==============================================================================
# Stage 1: Build the application
# ==============================================================================
# Use the full official Node.js image as the base.
# This version is based on Debian and includes more system utilities.
FROM node:20 AS builder

# Install system-level dependencies. Some npm packages need to compile
# native addons from C++ or Python, and require these build tools.
RUN apt-get update && apt-get install -y build-essential python3

# Set the working directory inside the container.
# This is where our code will live.
WORKDIR /app

# Copy the package.json and package-lock.json files.
# We copy these first to take advantage of Docker's layer caching.
# If these files don't change, Docker won't need to reinstall dependencies.
COPY package*.json ./

# Set npm to bypass certificate checks due to potential network issues
RUN npm config set strict-ssl false

# Install project dependencies.
# 'npm ci' is often preferred in CI/CD environments as it uses the lockfile
# for faster, more reliable builds. 'npm install' also works.
RUN npm ci

# Skip installing Vite globally as it's already in the project dependencies

# Copy the rest of the application source code into the container.
COPY . .

# Run the build script defined in package.json.
# This will create a 'dist' folder with the static production assets.
# Use npx to run the local vite installation
RUN npx vite build

# ==============================================================================
# Stage 2: Serve the application with Nginx
# ==============================================================================
# Use a lightweight Nginx image for the final, small production image.
# We can still use alpine here because it's just serving static files.
FROM nginx:stable-alpine

# Copy the custom Nginx configuration.
# This is important for single-page applications to handle routing correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the 'builder' stage.
# The source path must match the output directory of your build command.
# For Vite projects, the build output is in the 'dist' folder.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to allow traffic to the Nginx server.
EXPOSE 80

# The default Nginx image command will start the server.
# No need to add a CMD instruction here.
