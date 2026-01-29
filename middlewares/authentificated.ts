import { createMiddleware } from "hono/factory";
import db from "../utils/db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

export default createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  let token = authHeader.split(" ")[1];
  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.token, token))
    .get();

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  c.set("user", user);
  await next();
});
