FROM node:24-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace package files
COPY packages/db/package*.json ./packages/db/
COPY packages/sqs/package*.json ./packages/sqs/
COPY packages/metrics/package*.json ./packages/metrics/

# Copy app package files
COPY apps/api/package*.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source code
COPY packages ./packages
COPY apps/api ./apps/api

EXPOSE 8009

WORKDIR /app/apps/api
CMD ["npm", "run", "dev"]