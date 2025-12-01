## Multistage Dockerfile supporting both development and production

# Base for Node tasks
FROM node:20-alpine AS base
WORKDIR /app
ENV CI=true

# --- Development stage: Vite dev server ---
FROM base AS dev
COPY package*.json ./
RUN npm install --no-fund --no-audit
COPY . .
EXPOSE 5173
# Vite dev server bound to 0.0.0.0 for container access
CMD ["npm","run","dev","--","--host","0.0.0.0"]

# --- Build stage: produce static assets ---
FROM base AS build
COPY package*.json ./
RUN npm ci --no-fund --no-audit
COPY . .
ENV NODE_ENV=production
# Accept VITE_* via build args for production builds
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_API_BASE_URL
ARG VITE_PORTAL_BUSINESS_ID
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM}
ENV VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_PORTAL_BUSINESS_ID=${VITE_PORTAL_BUSINESS_ID}
RUN npm run build

# --- Production stage: Nginx serving static files ---
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
