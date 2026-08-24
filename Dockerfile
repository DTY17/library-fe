FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies + serve globally
COPY package*.json ./
RUN npm ci && npm install -g serve

# Copy application files and build static assets
COPY . .
RUN npm run build

# Listen on Cloud Run's $PORT (defaults to 8080)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]