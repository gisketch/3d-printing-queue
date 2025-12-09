# Stage 1: Build the app
FROM node:22-alpine as builder
WORKDIR /app

# COPY ONLY package.json to install dependencies first
COPY package.json ./

# Install dependencies (forcing Linux binaries)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build args
ARG VITE_POCKETBASE_URL
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL

# Build the static files
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# --- FIX START ---
# Create a proper Nginx configuration file
# This tells Nginx to listen on port 80 and redirect 404s to index.html
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
# --- FIX END ---

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
