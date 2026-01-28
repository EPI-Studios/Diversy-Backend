import { Hono } from "hono";
import { users as usersSchema } from "../../drizzle/schema";
import db from "../../utils/db";
import { eq } from "drizzle-orm";
const users = new Hono();

users.get("/:id", async (c) => {
  let id = c.req.param("id"); // username or id
  let user: typeof usersSchema.$inferSelect | undefined = undefined;

  user = await db
    .select()
    .from(usersSchema)
    .where(eq(usersSchema.id, Number(id)))
    .limit(1)
    .get();

  if (!user)
    user = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.username, id))
      .limit(1)
      .get();
  if (!user) return c.json({ error: "User not found" }, 404);

  let parsedUser = {
    id: user.id,
    username: user.username,
    display_name: user.displayName,
    avatar_url: user.avatarUrl,
    banner_url: user.bannerUrl,
    custom_css: user.customCss,
  };

  return c.json(parsedUser);
});

export default users;
