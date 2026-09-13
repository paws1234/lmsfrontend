# Vue 3 / vue-cli 5 frontend for the CTU LMS.
#
# Runs `vue-cli-service serve` (dev server with hot reload), the same entry point
# start_lms.sh used before.  node_modules is installed in the image and kept in a
# named volume by docker-compose; the source code is bind-mounted.
FROM node:22-bookworm-slim

# See backend/Dockerfile: prefer IPv4 so the container does not try to reach the
# npm registry over IPv6 it has no route for.
RUN echo 'precedence ::ffff:0:0/96  100' >> /etc/gai.conf

WORKDIR /app

# Dependencies first, so this layer is only rebuilt when the lock file changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 8080

CMD ["npm", "run", "serve", "--", "--host", "0.0.0.0", "--port", "8080"]
