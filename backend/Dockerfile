FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

FROM base AS deps
COPY package.json ./
# Use npm install (not ci) so the image builds without a committed lockfile.
RUN npm install --no-audit --no-fund

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
