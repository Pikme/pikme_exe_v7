import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  console.log('[serveStatic] Initializing static file serving');
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  } else {
    console.log('[serveStatic] Serving static files from:', distPath);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // BUT exclude SSR routes like /states/:slug
  app.use("*", (req, res, next) => {
    // Don't serve index.html for SSR routes
    // These should be handled by Express middleware before this catch-all
    if (req.path.startsWith('/states/') || req.path.startsWith('/tours/') || req.path.startsWith('/activities/')) {
      console.log('[serveStatic] Skipping catch-all for SSR route:', req.path);
      return res.status(404).send('Not found');
    }
    // Don't serve index.html for SEO files (sitemaps, robots.txt)
    if (req.path.endsWith('.xml') || req.path === '/robots.txt') {
      console.log('[serveStatic] Skipping catch-all for SEO file:', req.path);
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
