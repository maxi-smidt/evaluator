ARG NODE_VERSION=24.12.0-alpine
ARG NGINX_VERSION=1.29-alpine
ARG BUILD_MODE

# =========================================
# Stage 1: Build the Angular Application
# =========================================
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --legacy-peer-deps

COPY . .

RUN npm run build --configuration=$BUILD_MODE;


# =========================================
# Stage 2: Prepare Nginx to Serve Static Files
# =========================================
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner

USER nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --chown=nginx:nginx --from=builder /app/dist/*/browser /usr/share/nginx/html

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
