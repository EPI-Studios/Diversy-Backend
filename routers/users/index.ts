import { Hono } from "hono";
import User from "../../models/User";

const users = new Hono();

users.get("/:id", async (c) => {
  let id = c.req.param("id"); // username or id
  let user: User | null = null;

  user = await User.findOne({ where: { id } });

  if (!user) user = await User.findOne({ where: { username: id } });
  if (!user) return c.json({ error: "User not found" }, 404);

  let parsedUser = {
    id: user.get("id"),
    username: user.get("username"),
    display_name: user.get("display_name"),
    avatar_url: user.get("avatar_url"),
    banner_url: user.get("banner_url"),
    custom_css: user.get("custom_css"),
  };

  return c.json(parsedUser);
});

export default users;
