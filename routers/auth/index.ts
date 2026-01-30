import { Hono } from "hono";
import sendEmail from "../../utils/emails/sendEmail";
import db from "../../utils/db";
import { codes, users } from "../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

const auth = new Hono();

auth.post("/me", async (c) => {
  const Authorization = c.req.header("Authorization") || "";
  const token = Authorization.replace("Bearer ", "");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.token, token))
    .get();

  if (!user) {
    return c.json({ message: "Invalid token" }, 401);
  }

  if (user.deleted || user.disabled) {
    return c.json({ message: "User account is not active" }, 403);
  }

  return c.json(user);
});

auth.post("/", async (c) => {
  let body: any;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ message: "Invalid request body" }, 400);
  }

  let email = body.email;

  let user = await db.select().from(users).where(eq(users.email, email)).get();

  if (user && (user.deleted || user.disabled)) {
    return c.json({ message: "User account is not active" }, 403);
  }

  // Generate a verification code

  let code = await db.insert(codes).values({ email }).returning().get();

  await sendEmail(
    email,
    "Your Diversy Verification Code",
    `Your verification code is: ${code.code}`,
  );

  return c.json({ message: "Verification code sent" });
});

auth.post("/confirm", async (c) => {
  let body: any;

  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ message: "Invalid request body" }, 400);
  }
  let { email, code } = body;

  let user = await db.select().from(users).where(eq(users.email, email)).get();

  // Verify code logic here

  let foundCode = await db
    .select()
    .from(codes)
    .where(and(eq(codes.code, code), eq(codes.email, email)))
    .get();

  if (!foundCode) return c.json({ message: "Invalid code" }, 400);

  // Code is valid, proceed with authentication

  let token: string = "";

  if (!user) {
    // Create new user

    let user = await db
      .insert(users)
      .values({
        email,
        username: email.split("@")[0],
        displayName: email.split("@")[0],
        avatarUrl: "/guest-avatar.png",
      })
      .returning()
      .get();

    token = user.token;
  } else {
    token = user.token;
  }

  await db
    .delete(codes)
    .where(and(eq(codes.code, code), eq(codes.email, email)));

  return c.json({ message: "Authentication successful", token });
});

export default auth;
