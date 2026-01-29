import { Hono } from "hono";
import db from "../../utils/db";
import { communities as cm } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
const subrouters = ["chats", "forums", "wikis"] as const;

async function loadSubrouter(name: string) {
  const module = await import(`./${name}/index.ts`);
  return module.default as Hono;
}

const communities = new Hono();

for (const subrouterName of subrouters) {
  loadSubrouter(subrouterName).then((subrouter) => {
    communities.route(`/${subrouterName}`, subrouter);
  });
}

communities.get("/", async (c) => {
  const allCommunities = await db.select().from(cm).all();

  const parsed = [];
  for (const community of allCommunities) {
    parsed.push({
      id: community.id,
      name: community.name,
      description: community.description,
      bannerUrl: community.bannerUrl,
      iconUrl: community.iconUrl,
    });
  }

  return c.json(parsed);
});

communities.get("/:communityId", async (c) => {
  const communityId = c.req.param("communityId");

  let community = await db
    .select()
    .from(cm)
    .where(eq(cm.id, Number(communityId)))
    .get();
  if (!community) {
    return c.json({ message: "Community not found" }, 404);
  }

  return c.json(community);
});

export default communities;
