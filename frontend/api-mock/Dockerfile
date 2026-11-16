FROM node:22-alpine
WORKDIR /app
COPY server.js .
COPY seed ./seed
USER node
EXPOSE 8788
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s \
  # nosemgrep: 143f16df-07c6-5220-9244-6483042b0a8e
  CMD wget -qO- http://127.0.0.1:8788/health || exit 1
CMD ["node", "server.js"]
