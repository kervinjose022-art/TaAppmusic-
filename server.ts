import express from "express";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Root endpoint for simple checking
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Tappmusic" });
  });

  // Intercept and serve tappmusic.apk with proper Android headers and fallback
  app.get("/assets/tappmusic.apk", (req, res) => {
    const possiblePaths = [
      path.join(process.cwd(), "public", "assets", "tappmusic.apk"),
      path.join(process.cwd(), "assets", "tappmusic.apk"),
      path.join(process.cwd(), "dist", "assets", "tappmusic.apk")
    ];
    
    let foundPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    
    // Explicitly set Android MIME type and Content-Disposition headers to trigger binary download
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Disposition", 'attachment; filename="tappmusic.apk"');
    
    if (foundPath) {
      const stats = fs.statSync(foundPath);
      // If the file is extremely small, it is our text instructions/placeholder rather than a compiled binary APK
      if (stats.size > 1000) {
        console.log(`[Tappmusic] Serving real APK file from: ${foundPath} (${stats.size} bytes)`);
        return res.sendFile(foundPath);
      }
    }

    console.log("[Tappmusic] APK file not loaded or is a tiny placeholder. Serving valid binary ZIP/APK empty-archive stub on-the-fly.");
    // A standard 22-byte End of Central Directory record signifying an empty zip archive that downloads cleanly as a binary file:
    const emptyZipBytes = Buffer.from([
      0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    return res.send(emptyZipBytes);
  });

  const distPath = path.join(process.cwd(), "dist");

  // In production or when the dist build is available, serve static files
  if (process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"))) {
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
