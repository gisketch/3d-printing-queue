# Stage 1: Build the app
FROM node:22-alpine as builder
WORKDIR /app

# COPY ONLY package.json (Skip package-lock.json to avoid platform issues)
COPY package.json ./

# RUN npm install (Not npm ci) to force downloading the correct Linux binaries
RUN npm install

# Copy the rest of the files
COPY . .

# IMPORTANT: Build time variables
ARG VITE_POCKETBASE_URL
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Handle React Router 404s
RUN echo "error_page 404 /index.html;" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
