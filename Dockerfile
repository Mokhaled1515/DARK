# Monolith: Vite front + Express API. Build from repo root.

# --- Stage 1: build the SPA (Vite) ---
# Produces static HTML/JS/CSS under front/dist.
# FROM node:22-bookworm-slim AS front-build
# WORKDIR /app/front
# COPY front/package.json front/package-lock.json ./
# RUN npm install --no-audit --no-fund --legacy-peer-deps
# COPY front/ ./
# # Empty = browser calls /api on the same host as the page.
# ENV VITE_API_URL=
# # Public Clerk key is embedded in client JS.
# ARG VITE_CLERK_PUBLISHABLE_KEY
# ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
# RUN npm run build

# # --- Stage 2: build the API bundle ---
# # This back is ESM JavaScript, so npm run build copies src/ to dist/.
# FROM node:22-bookworm-slim AS back-build
# WORKDIR /app
# COPY back/package.json back/package-lock.json ./
# RUN npm install --no-audit --no-fund
# COPY back/ ./
# RUN npm run build

# # --- Stage 3: runtime image (only prod deps + built assets) ---
# # Express serves API routes and static files from public/.
# FROM node:22-bookworm-slim AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# ENV PORT=3001

# COPY back/package.json back/package-lock.json ./
# RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# COPY --from=back-build /app/dist ./dist
# COPY --from=front-build /app/front/dist ./public

# EXPOSE 3001
# USER node

# CMD ["node", "dist/index.js"]













# # =========================
# # Stage 1: Build Frontend
# # =========================

# FROM node:22-bookworm-slim AS front-build

# WORKDIR /app/front

# COPY front/package.json front/package-lock.json ./

# RUN npm install --no-audit --no-fund --legacy-peer-deps

# COPY front/ ./

# ENV VITE_API_URL=

# ARG VITE_CLERK_PUBLISHABLE_KEY
# ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# RUN npm run build


# # =========================
# # Stage 2: Backend
# # =========================

# FROM node:22-bookworm-slim AS runner

# WORKDIR /app

# ENV NODE_ENV=production
# ENV PORT=3001

# COPY back/package.json back/package-lock.json ./

# RUN npm install --omit=dev --no-audit --no-fund \
#     && npm cache clean --force

# COPY back/ ./

# COPY --from=front-build /app/front/dist ./public

# EXPOSE 3001

# USER node

# CMD ["node", "src/index.js"]




# =========================
# Stage 1: Build Frontend
# =========================

FROM node:22-bookworm-slim AS front-build

WORKDIR /app/front

COPY front/package.json front/package-lock.json ./

RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY front/ ./

ENV VITE_API_URL=

ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build


# =========================
# Stage 2: Backend + Frontend
# =========================

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY back/package.json back/package-lock.json ./

RUN npm install --omit=dev --no-audit --no-fund \
    && npm cache clean --force

COPY back/ ./

COPY --from=front-build /app/front/dist ./public

EXPOSE 3001

USER node

CMD ["node", "src/index.js"]