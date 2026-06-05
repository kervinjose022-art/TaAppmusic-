import express from "express";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check endpoint for Cloud Run ingress and monitoring
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Tappmusic" });
  });

  const distPath = path.join(process.cwd(), "dist");
  const indexHtmlExists = fs.existsSync(path.join(distPath, "index.html"));

  // Highly resilient check: if the production bundle is present on disk, serve statically
  if (process.env.NODE_ENV === "production" || indexHtmlExists) {
    console.log(`[Tappmusic] Booting in PRODUCTION mode. Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("[Tappmusic] Booting in DEVELOPMENT mode with Vite middleware.");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Tappmusic] Server listening directly on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[Tappmusic] Critical error during server startup:", error);
  process.exit(1);
});
