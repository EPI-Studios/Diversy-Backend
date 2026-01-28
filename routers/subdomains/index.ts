import { Hono } from "hono";
import admin_auth from "../../middlewares/admin_auth";
import Subdomain from "../../models/Subdomain";
import sendEmailByUserId from "../../utils/emails/sendEmailByUserId";
import User from "../../models/User";
import authentificated from "../../middlewares/authentificated";

const subdomains = new Hono();

subdomains.post("/request", authentificated, async (c) => {
  const user = c.get("user" as never) as User;

  const { name } = await c.req.json();

  const existingSubdomain = await Subdomain.findOne({ where: { name } });
  if (existingSubdomain) {
    return c.json({ error: "Subdomain already requested or taken" }, 400);
  }

  const subdomain = await Subdomain.create({
    name,
    initiator_id: user.get("id"),
    validated: false,
  });

  return c.json({ message: "Subdomain request submitted", subdomain });
});

subdomains.get("/demands", admin_auth, async (c) => {
  const demands = await Subdomain.findAll({ where: { validated: false } });
  return c.json(demands);
});

subdomains.post("/validate/:id", admin_auth, async (c) => {
  const id = c.req.param("id");
  const subdomain = await Subdomain.findByPk(id);

  if (!subdomain) {
    return c.json({ error: "Subdomain not found" }, 404);
  }
  subdomain.set("validated", true);
  subdomain.set("validated_at", Date.now());

  const initiatorId = subdomain.get("initiator_id") as number;
  const user = await User.findByPk(initiatorId);

  if (!user) {
    return c.json({ error: "Initiator user not found" }, 404);
  }

  await sendEmailByUserId(
    initiatorId,
    `Your subdomain "${subdomain.get("name")}.diversy.co" has been validated`,
    `Hello ${user.get("username")},
      
      We are pleased to inform you that your requested subdomain "${subdomain.get("name")}.diversy.co" has been successfully validated by our administration team.
      
      You can now start using your subdomain for your projects and services.
      
      If you have any questions or need further assistance, please feel free to contact our support team.
      
      Best regards,
      The Diversy Team
      
      (This is an automated message, please do not reply.)
      `,
  );

  await subdomain.save();
  return c.json({ message: "Subdomain validated successfully" });
});

subdomains.post("/reject/:id", admin_auth, async (c) => {
  const id = c.req.param("id");
  const subdomain = await Subdomain.findByPk(id);

  if (!subdomain) {
    return c.json({ error: "Subdomain not found" }, 404);
  }

  const initiatorId = subdomain.get("initiator_id") as number;
  const user = await User.findByPk(initiatorId);

  if (!user) {
    return c.json({ error: "Initiator user not found" }, 404);
  }

  await sendEmailByUserId(
    initiatorId,
    `Your subdomain "${subdomain.get("name")}.diversy.co" has been rejected`,
    `Hello ${user.get("username")},
    
    We would like to inform you that your requested subdomain "${subdomain.get("name")}.diversy.co" has been rejected by our administration team.
    
    If you have any questions or need further assistance, please feel free to contact our support team.
    
    Best regards,
    The Diversy Team
    
    (This is an automated message, please do not reply.)
    `,
  );

  await subdomain.destroy();
  return c.json({ message: "Subdomain rejected and deleted successfully" });
});

export default subdomains;
