import { eq } from "drizzle-orm";
import { mailtrap, sender } from ".";
import { users } from "../../drizzle/schema";
import db from "../db";

export default async function sendEmailByUserId(
  userId: number,
  subject: string,
  text: string,
) {
  let u = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u.length) return false;

  let email = u[0].email as string;

  mailtrap.send({
    from: sender,
    to: [{ email }],
    subject: subject,
    text: text,
  });
}
