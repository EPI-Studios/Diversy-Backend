import { mailtrap, sender } from ".";

export default async function sendEmail(
  email: string,
  subject: string,
  text: string,
) {
  return await mailtrap.send({
    from: sender,
    to: [{ email }],
    subject,
    text,
  });
}
