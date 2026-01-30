import { Hono } from "hono";
import { users as usersSchema } from "../../drizzle/schema";
import db from "../../utils/db";
import { eq } from "drizzle-orm";
import authentificated from "../../middlewares/authentificated";
import sendEmailByUserId from "../../utils/emails/sendEmailByUserId";
const users = new Hono();

users.get("/:id", async (c) => {
  let id = c.req.param("id"); // username or id
  let user: Partial<typeof usersSchema.$inferSelect> | undefined = undefined;

  const selectData = {
    id: usersSchema.id,
    username: usersSchema.username,
    displayName: usersSchema.displayName,
    avatarUrl: usersSchema.avatarUrl,
    bannerUrl: usersSchema.bannerUrl,
    customCss: usersSchema.customCss,
    deleted: usersSchema.deleted,
    createdAt: usersSchema.createdAt,
    updatedAt: usersSchema.updatedAt,
    biography: usersSchema.biography,
  };

  user = await db
    .select(selectData)
    .from(usersSchema)
    .where(eq(usersSchema.id, Number(id)))
    .get();

  if (!user)
    user = await db
      .select(selectData)
      .from(usersSchema)
      .where(eq(usersSchema.username, id))
      .get();

  if (!user) return c.json({ message: "User not found" }, 404);

  if (user.deleted) {
    user.username = "deleted-user";
    user.displayName = "Deleted User";
    user.avatarUrl = "/guest-avatar.png";
    user.bannerUrl = null;
    user.customCss = "";
    user.biography = `*Account deleted since ${new Date(
      user.updatedAt || 0,
    ).toDateString()}*`;
  }

  return c.json(user);
});

users.put("/", authentificated, async (c) => {
  const user = c.get("user" as never) as typeof usersSchema.$inferSelect;

  const { username, avatarUrl, bannerUrl, customCss, biography } =
    await c.req.parseBody<{
      [key: string]: string;
    }>();

  await db
    .update(usersSchema)
    .set({
      displayName: username ?? user.displayName,
      username: username ?? user.username,
      avatarUrl: avatarUrl ?? user.avatarUrl,
      bannerUrl: bannerUrl ?? user.bannerUrl,
      customCss: customCss ?? user.customCss,
      biography: biography ?? user.biography,
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
