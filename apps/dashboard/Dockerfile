FROM node:24-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./tsconfig.json

# Copy app package files
COPY apps/dashboard/package*.json ./apps/dashboard/
COPY apps/dashboard/tsconfig.json ./apps/dashboard/
COPY apps/dashboard/vite.config.ts ./apps/dashboard/
COPY apps/dashboard/tailwind.config.js ./apps/dashboard/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/dashboard ./apps/dashboard

WORKDIR /app/apps/dashboard

EXPOSE 5220

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]