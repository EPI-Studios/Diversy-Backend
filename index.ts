import { readdirSync } from "fs";
import { Hono } from "hono";
import { LinearRouter } from "hono/router/linear-router";
import path from "path";
import { cors } from "hono/cors";

const app = new Hono({ router: new LinearRouter() });

app.use(cors());

app.get("/", (c) => {
  return c.json({ message: "API is running" });
});

async function loadRouters() {
  let map = new Map<string, Hono>();

  let routersFolderPath = path.join(process.cwd(), "routers");

  let routerFolders = readdirSync(routersFolderPath, {
    withFileTypes: true,
  });

  for (let folder of routerFolders) {
    if (folder.isDirectory()) {
      let routerPath = path.join(routersFolderPath, folder.name, "index.ts");
      let { default: router } = await import(routerPath);

      map.set(`${folder.name}`, router);
    }
  }

  return map;
}

await loadRouters().then((routers) => {
  routers.forEach((router, prefix) => {
    app.route(`/${prefix}`, router);
  });
});

export default app;
