import { Hono } from "hono";
import Community from "../../models/Community";

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
  const allCommunities = await Community.findAll();

  const parsed = [];
  for (const community of allCommunities) {
    parsed.push({
      id: community.id,
      name: community.name,
      description: community.description,
      banner_url: community.banner_url,
      icon_url: community.icon_url,
    });
  }

  return c.json(parsed);
});

communities.get("/:communityId", async (c) => {
  const communityId = c.req.param("communityId");

  let community = await Community.findByPk(communityId);
  if (!community) {
    return c.json({ error: "Community not found" }, 404);
  }

  return c.json(community);
});

export default communities;
