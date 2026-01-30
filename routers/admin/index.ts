import { Hono } from "hono";
import db from "../../utils/db";
import { users } from "../../drizzle/schema";
import admin_auth from "../../middlewares/admin_auth";
import { eq } from "drizzle-orm";
import sendEmailByUserId from "../../utils/emails/sendEmailByUserId";

const adminRouter = new Hono();

adminRouter.get("/users", admin_auth, async (c) => {
  // List all users

  const allUsers = await db.select().from(users).all();

  const parsedUsers = allUsers.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    disabled: Boolean(user.disabled),
    admin: Boolean(user.admin),
    deleted: Boolean(user.deleted),
    deletedAt: user.deletedAt,
  }));

  return c.json(parsedUsers);
});

adminRouter.delete("/users/:id", admin_auth, async (c) => {
  let id = c.req.param("id"); // id

  let user = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(id)))
    .get();

  if (!user) return c.json({ message: "User not found" }, 404);

  await db
    .update(users)
    .set({ deleted: 1, deletedAt: Date.now() })
    .where(eq(users.id, user.id));

  await sendEmailByUserId(
    user.id,
    `Account Deleted`,
    `
        Hello ${user.displayName},

        We wanted to inform you that your account on Diversy has been permanently deleted by an administrator. If you believe this was done in error or have any questions, please contact our support team.

        Best regards,
        The Diversy Team`,
  );

  return c.json({ message: "User account permanently deleted" });
});

adminRouter.post("/users/purge-deleted", admin_auth, async (c) => {
  // Permanently delete all users marked as deleted for more than 30 days
  const days = Number(process.env.DELAY_RULE_TIME!); // in days
  const msInDay = 24 * 60 * 60 * 1000;
  const threshold = days * msInDay;

  let now = Date.now();

  const usersToPurge = await db
    .select()
    .from(users)
    .where(eq(users.deleted, 1))
    .all();

  for (const user of usersToPurge) {
    const deletedDate = new Date(user.deletedAt!).getTime();

    if (now - deletedDate >= threshold) {
      await db.delete(users).where(eq(users.id, user.id));
    }
  }

  return c.json({ message: "Purge process completed" });
});

export default adminRouter;
