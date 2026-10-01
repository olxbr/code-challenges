FROM node:22-alpine
WORKDIR /app
COPY server.js .
USER node
EXPOSE 8787
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8787/health || exit 1
CMD ["node", "server.js"]
