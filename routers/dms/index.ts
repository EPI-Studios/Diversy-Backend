import { Context, Hono } from "hono";
import authentificated from "../../middlewares/authentificated";
import { privateMessages, users } from "../../drizzle/schema";
import db from "../../utils/db";
import { eq, and } from "drizzle-orm";

type Env = {
  Variables: {
    user: typeof users.$inferSelect;
  };
};

const dms = new Hono<Env>(); // Direct messages Router

dms.use(authentificated);

dms.get("/", async (c) => {
  const user = c.get("user");
  const messages = await db
    .select()
    .from(privateMessages)
    .where(eq(privateMessages.receiverId, user.id))
    .all();

  return c.json(messages);
});

dms.get("/:otherUserId", async (c) => {
  const user = c.get("user");
  const { otherUserId } = c.req.param();

  const otherUser = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(otherUserId)))
    .get();
  if (!otherUser) {
    return c.json({ message: "User not found" }, 404);
  }

  const messages = await db
    .select()
    .from(privateMessages)
    .where(
      and(
        eq(privateMessages.senderId, otherUser.id),
        eq(privateMessages.receiverId, user.id),
      ),
    )
    .orderBy(privateMessages.createdAt)
    .all();

  return c.json(messages);
});

dms.put("/:messageId", async (c) => {
  const user = c.get("user");
  const { messageId } = c.req.param();
  const { content } = await c.req.json();

  const message = await db
    .select()
    .from(privateMessages)
    .where(eq(privateMessages.id, Number(messageId)))
    .get();
  if (!message) {
    return c.json({ message: "Message not found" }, 404);
  }

  if (message.senderId !== user.id) {
    return c.json({ message: "Forbidden" }, 403);
  }

  db.update(privateMessages)
    .set({ content, updatedAt: Date.now() })
    .where(eq(privateMessages.id, Number(messageId)));

  return c.json(message);
});

dms.post("/:receiverId", async (c) => {
  const user = c.get("user");
  const { receiverId } = c.req.param();
  const { content } = await c.req.json();

  const receiver = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(receiverId)))
    .get();
  if (!receiver) {
    return c.json({ message: "Receiver not found" }, 404);
  }

  const message = await db.insert(privateMessages).values({
    senderId: user.id,
    receiverId: receiver.id,
    content,
  });

  return c.json(message, 201);
});

dms.delete("/:messageId", async (c) => {
  const user = c.get("user");
  const { messageId } = c.req.param();

  const message = await db
    .select()
    .from(privateMessages)
    .where(eq(privateMessages.id, Number(messageId)))
    .get();
  if (!message) {
    return c.json({ message: "Message not found" }, 404);
  }

  if (message.senderId !== user.id && message.receiverId !== user.id) {
    return c.json({ message: "Forbidden" }, 403);
  }

  await db
    .update(privateMessages)
    .set({ deleted: 1, deletedAt: Date.now() })
    .where(eq(privateMessages.id, Number(messageId)));

  return c.json({ success: true, message: "Message deleted successfully" });
});

export default dms;
