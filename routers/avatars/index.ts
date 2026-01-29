import { Hono } from "hono";
import { getFile, uploadAvatar } from "../../utils/cloudflare/storage";
import authentificated from "../../middlewares/authentificated";
import { users } from "../../drizzle/schema";
import db from "../../utils/db";
import { eq } from "drizzle-orm";

type Env = {
  Variables: {
    user: typeof users.$inferSelect;
  };
};

const avatars = new Hono<Env>();

avatars.get("/:userId", async (c) => {
  const { userId } = c.req.param();
  const fileKey = `avatars/${userId}.png`;

  try {
    const base64url = await getFile(fileKey, "avatar");
    if (!base64url) return c.json({ message: "Avatar not found" }, 404);

    return c.body(base64url, 200, {
      "Content-Type": "image/png",
    });
  } catch (error) {
    return c.json({ message: "Avatar not found" }, 404);
  }
});

avatars.post("/", authentificated, async (c) => {
  // Handle avatar upload

  const user = c.get("user");

  const formData = await c.req.formData();
  const avatar = formData.get("avatar") as string;

  if (!avatar) {
    return c.json({ message: "No avatar provided" }, 400);
  }

  try {
    await uploadAvatar(avatar, user.id.toString());

    db.update(users)
      .set({ avatarUrl: `https://r2.diversy.co/avatars/${user.id}.png` })
      .where(eq(users.id, user.id as number));

    return c.json({ message: "Avatar uploaded successfully" });
  } catch (error) {
    return c.json({ message: "Failed to upload avatar" }, 500);
  }
});

export default avatars;
