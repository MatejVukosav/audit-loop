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
COPY apps/worker/package*.json ./apps/worker/
COPY apps/worker/tsconfig.json ./apps/worker/

# Install dependencies
RUN npm install

# Copy source code
COPY packages ./packages
COPY apps/worker ./apps/worker

WORKDIR /app/apps/worker
CMD ["npm", "run", "dev"]