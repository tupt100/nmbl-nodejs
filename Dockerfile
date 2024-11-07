# Install dependencies
FROM node:16.15.1-bullseye-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Build step
COPY . .
RUN npm run build:prod

# Runtime nginx container
FROM nginx:1.27-alpine3.20-slim
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
