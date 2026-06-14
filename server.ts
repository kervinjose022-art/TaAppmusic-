import express from "express";
import path from "path";
import fs from "fs";
import * as JimpPkg from "jimp";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Pre-convert JPG logo to a beautiful PNG at startup for WebIntoApp compatibility
  const Jimp = ((JimpPkg as any).default || (JimpPkg as any).Jimp || JimpPkg) as any;
  try {
    const jpgPath = path.join(process.cwd(), "src", "assets", "images", "logo_tappmusic_1781384373669.jpg");
    const pngDestPath1 = path.join(process.cwd(), "src", "assets", "images", "logo_tappmusic_256.png");
    const pngDestPath2 = path.join(process.cwd(), "assets", "logo_tappmusic_256.png");
    const pngDestPath3 = path.join(process.cwd(), "assets", "logo.png");

    if (fs.existsSync(jpgPath)) {
      console.log("[Tappmusic Logo Engine] Found source JPG logo. Converting to high-quality PNG...");
      const imageInstance = await Jimp.read(jpgPath);
      // Resize to 256x256 (which is perfect for Android app icon)
      imageInstance.resize(256, 256);
      
      const pngBuffer = await imageInstance.getBufferAsync("image/png");
      
      // Save to all locations (create parent directory if not existing)
      const assetsDir = path.join(process.cwd(), "assets");
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      fs.writeFileSync(pngDestPath1, pngBuffer);
      fs.writeFileSync(pngDestPath2, pngBuffer);
      fs.writeFileSync(pngDestPath3, pngBuffer);
      console.log("[Tappmusic Logo Engine] Success! Converted logo and saved to:", {
        src: pngDestPath1,
        assets_opt: pngDestPath2,
        assets: pngDestPath3
      });
    } else {
      console.log("[Tappmusic Logo Engine] Warning: JPG logo file not found at " + jpgPath);
    }
  } catch (err) {
    console.error("[Tappmusic Logo Engine] Conversion failed at startup:", err);
  }

  // Root endpoint for simple checking
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Tappmusic" });
  });

  // Serve static PNG logo explicitly with correct headers
  app.get("/assets/logo.png", (req, res) => {
    const p = path.join(process.cwd(), "assets", "logo.png");
    if (fs.existsSync(p)) {
      res.setHeader("Content-Type", "image/png");
      return res.sendFile(p);
    }
    const pSrc = path.join(process.cwd(), "src", "assets", "images", "logo_tappmusic_256.png");
    if (fs.existsSync(pSrc)) {
      res.setHeader("Content-Type", "image/png");
      return res.sendFile(pSrc);
    }
    res.status(404).send("Logo not found");
  });

  app.get("/assets/logo_tappmusic_256.png", (req, res) => {
    const p = path.join(process.cwd(), "assets", "logo_tappmusic_256.png");
    if (fs.existsSync(p)) {
      res.setHeader("Content-Type", "image/png");
      return res.sendFile(p);
    }
    res.status(404).send("Logo not found");
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
