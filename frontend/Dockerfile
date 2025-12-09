# Stage 1: Build the app
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# IMPORTANT: Build time variables
ARG VITE_POCKETBASE_URL
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the built files from Stage 1 to Nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 (internal to container)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
