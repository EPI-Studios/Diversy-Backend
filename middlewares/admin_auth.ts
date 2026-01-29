import { createMiddleware } from "hono/factory";
import db from "../utils/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export default createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let token = authHeader.split(" ")[1];
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.token, token))
    .get();
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!user.admin) {
    return c.json({ error: "Forbidden" }, 403);
  }

  c.set("user", user);
  await next();
});
