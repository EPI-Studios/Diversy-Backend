import { MailtrapClient } from "mailtrap";

export let mailtrap = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN!,
});

export const sender = {
  email: "auth@diversy.co",
  name: "Diversy Auth",
};
