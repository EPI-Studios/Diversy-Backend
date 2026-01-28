import { INTEGER, Model, STRING } from "sequelize";
import Community from "./Community";
import sequelize from "../utils/db";
import WikiCommunity from "./WikiCommunity";
import User from "./User";

export default class ForumPostCommunity extends Model {
  id!: number;
  title!: string;
  content!: string;
  thumbnail_url?: string;
  community_id!: number;
  author_id!: number;
}

ForumPostCommunity.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: STRING,
      allowNull: false,
      defaultValue: "",
    },
    content: {
      type: STRING,
      allowNull: false,
      defaultValue: "",
    },
    thumbnail_url: {
      type: STRING,
      allowNull: true,
    },
  },
  { sequelize, timestamps: false },
);

Community.hasMany(ForumPostCommunity, {
  foreignKey: "community_id",
});

ForumPostCommunity.belongsTo(Community, {
  foreignKey: "community_id",
});

ForumPostCommunity.belongsTo(User, {
  foreignKey: "author_id",
});
