import express from "express";
import path from "path";
import fs from "fs";
import * as JimpPkg from "jimp";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Pre-convert JPG logo to a beautiful PNG at startup for WebIntoApp compatibility
  let Jimp: any = (JimpPkg as any).Jimp;
  if (!Jimp || typeof Jimp.read !== "function") {
    Jimp = (JimpPkg as any).default?.Jimp || (JimpPkg as any).default || JimpPkg;
  }
  if (typeof Jimp.read !== "function" && JimpPkg && typeof (JimpPkg as any).read === "function") {
    Jimp = JimpPkg;
  }

  try {
    const jpgPath = path.join(process.cwd(), "src", "assets", "images", "logo_tappmusic_1781384373669.jpg");
    const pngDestPath1 = path.join(process.cwd(), "src", "assets", "images", "logo_tappmusic_256.png");
    const pngDestPath2 = path.join(process.cwd(), "assets", "logo_tappmusic_256.png");
    const pngDestPath3 = path.join(process.cwd(), "assets", "logo.png");

    if (fs.existsSync(jpgPath)) {
      console.log("[Tappmusic Logo Engine] Found source JPG logo. Converting to high-quality PNG...");
      const imageInstance = await Jimp.read(jpgPath);
      // Resize to 256x256 using the modern Jimp v1 options object signature
      imageInstance.resize({ w: 256, h: 256 });
      
      // Get buffer using the modern async getBuffer method of Jimp v1
      const pngBuffer = await imageInstance.getBuffer("image/png");
      
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

  // Serve the VIP Flyer image with direct and download triggers support
  app.get("/assets/tappmusic_vip_flyer.jpg", (req, res) => {
    const possiblePaths = [
      path.join(process.cwd(), "assets", "tappmusic_vip_flyer.jpg"),
      path.join(process.cwd(), "src", "assets", "images", "tappmusic_vip_flyer.jpg"),
      path.join(process.cwd(), "public", "assets", "tappmusic_vip_flyer.jpg")
    ];
    let foundPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    if (foundPath) {
      if (req.query.download === "true") {
        res.setHeader("Content-Disposition", 'attachment; filename="tappmusic_flyer_vip.jpg"');
      }
      res.setHeader("Content-Type", "image/jpeg");
      return res.sendFile(foundPath);
    }
    res.status(404).send("Flyer not found");
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
      if (stats.size > 1000000) {
        console.log(`[Tappmusic] Serving real APK file from: ${foundPath} (${stats.size} bytes)`);
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        res.setHeader("Content-Disposition", 'attachment; filename="tappmusic.apk"');
        return res.sendFile(foundPath);
      }
    }

    console.log("[Tappmusic] APK file not loaded or is a tiny placeholder. Redirecting to Google Drive official APK.");
    return res.redirect("https://drive.google.com/file/d/1TqGkx8aglLR2SyKsi6L-eOW-QBUeeHr5/view?usp=drivesdk");
  });

  const distPath = path.join(process.cwd(), "dist");

  // In production or when the dist build is available, serve static files
  if (process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"))) {
    console.log(`[Tappmusic] Booting in PRODUCTION mode. Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      const indexPath = path.join(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        console.warn(`[Tappmusic] Warning: dist/index.html does not exist. Serving standby html...`);
        res.status(503).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Tappmusic Cargo...</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { background: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                .card { border: 1px solid #27272a; padding: 2rem; border-radius: 1rem; max-width: 440px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); background: #121214; }
                h1 { color: #f0b90b; font-size: 1.25rem; margin-top: 0; margin-bottom: 0.5rem; font-weight: 800; text-transform: uppercase; }
                p { color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin: 0; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Sincronizando Sistema</h1>
                <p>El portal se está terminando de compilar e iniciando servicios. Por favor recarga la página en unos segundos.</p>
              </div>
            </body>
          </html>
        `);
        return;
      }
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("[Tappmusic] Error sending index.html:", err);
          if (!res.headersSent) {
            res.status(500).send("Error serving client application.");
          }
        }
      });
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

process.on("uncaughtException", (error) => {
  console.error("[Tappmusic] Caught uncaughtException to prevent crash:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Tappmusic] Caught unhandledRejection to prevent crash. Reason:", reason);
});

startServer().catch((error) => {
  console.error("[Tappmusic] Critical error during server startup:", error);
  process.exit(1);
});
