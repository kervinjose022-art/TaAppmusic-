import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve static assets or mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting dev server with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting production server...');
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files with explicit index fallback
    app.use(express.static(distPath));
    
    // Fallback for SPA routing to avoid "Page not found" errors
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
