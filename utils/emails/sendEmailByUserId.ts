import { mailtrap, sender } from ".";
import User from "../../models/User";

export default async function sendEmailByUserId(
  userId: number,
  subject: string,
  text: string,
) {
  let u = await User.findByPk(userId);

  if (!u) return false;

  let email = u.get("email") as string;

  mailtrap.send({
    from: sender,
    to: [{ email }],
    subject: subject,
    text: text,
  });
}
