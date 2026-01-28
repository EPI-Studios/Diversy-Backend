import { createMiddleware } from "hono/factory";
import User from "../models/User";

export default createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let token = authHeader.split(" ")[1];
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const user = await User.findOne({ where: { token } });
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if ((user.get("admin") as boolean) !== true) {
    return c.json({ error: "Forbidden" }, 403);
  }

  c.set("user", user);
  await next();
});
