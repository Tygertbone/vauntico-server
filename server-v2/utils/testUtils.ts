import express from "express";
import { Server } from "http";

/**
 * Creates a test server with given router
 */
export function createTestServer(router: express.Router): Server {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", router);

  // Add health endpoint for testing
  app.get("/metrics", (req, res) => {
    res.status(200).type("text/plain").send("OK");
  });

  return app.listen(0); // Use random port
}

/**
 * Closes test server
 */
export async function closeTestServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}
