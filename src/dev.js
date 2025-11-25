// dev.js
import app, { prisma, env } from "./src/index.js";

const PORT = env.port || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// graceful shutdown untuk lokal
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error("Error disconnecting prisma:", err);
  }
  server.close(() => process.exit(0));
});
