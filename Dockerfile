# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: Backend + serve built frontend
FROM node:20-alpine

WORKDIR /app

# Install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend ./backend

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app/backend

EXPOSE 3001

# Use node to run server.js
CMD ["node", "server.js"]
