import { Hono } from "hono";
import { users as usersSchema } from "../../drizzle/schema";
import db from "../../utils/db";
import { eq } from "drizzle-orm";
import authentificated from "../../middlewares/authentificated";
import sendEmailByUserId from "../../utils/emails/sendEmailByUserId";
const users = new Hono();

users.get("/:id", async (c) => {
  let id = c.req.param("id"); // username or id
  let user: typeof usersSchema.$inferSelect | undefined = undefined;

  user = await db
    .select()
    .from(usersSchema)
    .where(eq(usersSchema.id, Number(id)))
    .get();

  if (!user)
    user = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.username, id))
      .get();

  if (!user) return c.json({ message: "User not found" }, 404);

  let parsedUser = {
    id: user.id,
    username: user.deleted ? "deleted-user" : user.username,
    display_name: user.deleted ? "Deleted User" : user.displayName,
    avatar_url: user.deleted ? "/guest-avatar.png" : user.avatarUrl,
    banner_url: user.deleted ? null : user.bannerUrl,
    custom_css: user.deleted ? "" : user.customCss,
  };

  return c.json(parsedUser);
});

users.put("/", authentificated, async (c) => {
  const user = c.get("user" as never) as typeof usersSchema.$inferSelect;

  const { displayName, avatarUrl, bannerUrl, customCss } =
    await c.req.parseBody<{ [key: string]: string }>();

  await db
    .update(usersSchema)
    .set({
      displayName: displayName ?? user.displayName,
      avatarUrl: avatarUrl ?? user.avatarUrl,
      bannerUrl: bannerUrl ?? user.bannerUrl,
      customCss: customCss ?? user.customCss,
      updatedAt: Date.now(),
    })
    .where(eq(usersSchema.id, user.id));

  return c.json({ message: "User updated successfully" });
});

users.delete("/", authentificated, async (c) => {
  const user = c.get("user" as never) as typeof usersSchema.$inferSelect;

  await db
    .update(usersSchema)
    .set({ disabled: 1 })
    .where(eq(usersSchema.id, user.id));

  await sendEmailByUserId(
    user.id,
    `Account Disabled`,
    `Hello ${user.displayName},

     We wanted to inform you that your account on Diversy has been disabled as per your request (or someone's request). If you did not intend to disable your account or have any questions, please contact our support team.
     If it was you and if you want to delete your account permanently, please reach out to our support team for further assistance.
     If it was not intended, please contact our support team immediately.

     Best regards,
     The Diversy Team`,
  );

  return c.json({ message: "User disabled successfully" });
});

export default users;
