import { Context, Hono } from "hono";
import authentificated from "../../middlewares/authentificated";
import PrivateMessage from "../../models/PrivateMessage";
import User from "../../models/User";

type Env = {
  Variables: {
    user: User;
  };
};

const dms = new Hono<Env>(); // Direct messages Router

dms.use(authentificated);

dms.get("/", async (c) => {
  const user = c.get("user");
  const messages = await PrivateMessage.findAll({
    where: {
      receiverId: user.get("id"),
    },
    order: [["createdAt", "DESC"]],
  });

  return c.json(messages);
});

dms.get("/:otherUserId", async (c) => {
  const user = c.get("user");
  const { otherUserId } = c.req.param();

  const otherUser = await User.findByPk(otherUserId);
  if (!otherUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const messages = await PrivateMessage.findAll({
    where: {
      senderId: otherUser.get("id"),
      receiverId: user.get("id"),
    },
    order: [["createdAt", "ASC"]],
  });

  return c.json(messages);
});

dms.put("/:messageId", async (c) => {
  const user = c.get("user");
  const { messageId } = c.req.param();
  const { content } = await c.req.json();

  const message = await PrivateMessage.findByPk(messageId);
  if (!message) {
    return c.json({ error: "Message not found" }, 404);
  }

  if (message.get("senderId") !== user.get("id")) {
    return c.json({ error: "Forbidden" }, 403);
  }

  message.set("content", content);
  message.set("updatedAt", Date.now());
  await message.save();

  return c.json(message);
});

dms.post("/:receiverId", async (c) => {
  const user = c.get("user");
  const { receiverId } = c.req.param();
  const { content } = await c.req.json();

  const receiver = await User.findByPk(receiverId);
  if (!receiver) {
    return c.json({ error: "Receiver not found" }, 404);
  }

  const message = await PrivateMessage.create({
    senderId: user.get("id"),
    receiverId: receiver.get("id"),
    content,
  });

  await message.save();

  return c.json(message, 201);
});

export default dms;
