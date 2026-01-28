import { Hono } from "hono";
import User from "../../models/User";
import Code from "../../models/Code";
import sendEmail from "../../utils/emails/sendEmail";

const auth = new Hono();

auth.post("/me", async (c) => {
  const Authorization = c.req.header("Authorization") || "";
  const token = Authorization.replace("Bearer ", "");

  const user = await User.findOne({ where: { token } });

  if (!user) {
    return c.json({ error: "Invalid token" }, 401);
  }

  return c.json(user);
});

auth.post("/", async (c) => {
  let body: any;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ error: "Invalid request body" }, 400);
  }

  console.log(body);
  let email = body.email;
  // Generate a verification code

  let code = await Code.create({ email });
  code.save();
  let codeStr = code.get("code") as string;

  await sendEmail(
    email,
    "Your Diversy Verification Code",
    `Your verification code is: ${codeStr}`,
  );

  return c.json({ message: "Verification code sent" });
});

auth.post("/confirm", async (c) => {
  let body: any;

  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ error: "Invalid request body" }, 400);
  }
  let { email, code } = body;

  let user = await User.findOne({ where: { email } });

  // Verify code logic here

  return await Code.findOne({ where: { code, email } }).then(
    async (foundCode) => {
      if (!foundCode) {
        return c.json({ error: "Invalid code" }, 400);
      }

      // Code is valid, proceed with authentication

      let token: string = "";

      if (!user) {
        // Create new user
        let user = await User.create({
          email,
          username: email.split("@")[0],
          display_name: email.split("@")[0],
          avatar_url: "/guest-avatar.png",
        });

        user.save();

        token = user.get("token") as string;
      } else {
        token = user.get("token") as string;
      }

      await foundCode.destroy();

      return c.json({ message: "Authentication successful", token });
    },
  );
});

export default auth;
