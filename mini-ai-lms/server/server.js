const http = require("http"); // Trigger restart

const app = require("./src/app");
const env = require("./src/config/env");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");
const { initSocket } = require("./src/sockets/socket");

const server = http.createServer(app);

initSocket(server);

const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

startServer();