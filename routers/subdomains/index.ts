import { Hono } from "hono";
import admin_auth from "../../middlewares/admin_auth";
import sendEmailByUserId from "../../utils/emails/sendEmailByUserId";
import authentificated from "../../middlewares/authentificated";
import { users } from "../../drizzle/schema";
import { subdomains as sb } from "../../drizzle/schema";
import db from "../../utils/db";
import { eq } from "drizzle-orm";
const subdomains = new Hono();

subdomains.post("/request", authentificated, async (c) => {
  const user = c.get("user" as never) as typeof users.$inferSelect;

  const { name } = await c.req.json();

  const existingSubdomain = await db
    .select()
    .from(sb)
    .where(eq(sb.name, name))
    .get();
  if (existingSubdomain) {
    return c.json({ message: "Subdomain already requested or taken" }, 400);
  }

  const subdomain = await db.insert(sb).values({
    name,
    initiatorId: user.id,
    validated: 0,
  });

  return c.json({ message: "Subdomain request submitted", subdomain });
});

subdomains.get("/demands", admin_auth, async (c) => {
  const demands = await db.select().from(sb).where(eq(sb.validated, 0)).all();
  return c.json(demands);
});

subdomains.post("/validate/:id", admin_auth, async (c) => {
  const id = c.req.param("id");
  const subdomain = await db
    .select()
    .from(sb)
    .where(eq(sb.id, Number(id)))
    .get();

  if (!subdomain) {
    return c.json({ message: "Subdomain not found" }, 404);
  }

  await db
    .update(sb)
    .set({ validated: 1, validatedAt: Date.now() })
    .where(eq(sb.id, Number(id)));

  const initiatorId = subdomain.initiatorId;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, initiatorId))
    .get();

  if (!user) {
    return c.json({ message: "Initiator user not found" }, 404);
  }

  await sendEmailByUserId(
    initiatorId,
    `Your subdomain "${subdomain.name}.diversy.co" has been validated`,
    `Hello ${user.username},
      
      We are pleased to inform you that your requested subdomain "${subdomain.name}.diversy.co" has been successfully validated by our administration team.
      
      You can now start using your subdomain for your projects and services.
      
      If you have any questions or need further assistance, please feel free to contact our support team.
      
      Best regards,
      The Diversy Team
      
      (This is an automated message, please do not reply.)
      `,
  );

  return c.json({ message: "Subdomain validated successfully" });
});

subdomains.post("/reject/:id", admin_auth, async (c) => {
  const id = c.req.param("id");
  const subdomain = await db
    .select()
    .from(sb)
    .where(eq(sb.id, Number(id)))
    .get();

  if (!subdomain) {
    return c.json({ message: "Subdomain not found" }, 404);
  }

  const initiatorId = subdomain.initiatorId;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, initiatorId))
    .get();

  if (!user) {
    return c.json({ message: "Initiator user not found" }, 404);
  }

  await sendEmailByUserId(
    initiatorId,
    `Your subdomain "${subdomain.name}.diversy.co" has been rejected`,
    `Hello ${user.username},
    
    We would like to inform you that your requested subdomain "${subdomain.name}.diversy.co" has been rejected by our administration team.
    
    If you have any questions or need further assistance, please feel free to contact our support team.
    
    Best regards,
    The Diversy Team
    
    (This is an automated message, please do not reply.)
    `,
  );

  await db.delete(sb).where(eq(sb.id, Number(id)));
  return c.json({ message: "Subdomain rejected and deleted successfully" });
});

export default subdomains;
