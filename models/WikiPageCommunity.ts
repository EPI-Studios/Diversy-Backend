import { INTEGER, Model, STRING } from "sequelize";
import sequelize from "../utils/db";
import WikiCommunity from "./WikiCommunity";

export default class WikiPageCommunity extends Model {
  id!: number;
  main_content!: string;
}

WikiPageCommunity.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    main_content: {
      type: STRING,
      allowNull: false,
      defaultValue: "{}",
    },
  },
  { sequelize },
);

WikiPageCommunity.belongsTo(WikiPageCommunity, {
  foreignKey: "parent_id",
  as: "parent_page",
});

WikiPageCommunity.hasMany(WikiPageCommunity, {
  foreignKey: "parent_id",
  as: "subpages",
});

WikiPageCommunity.belongsTo(WikiCommunity, {
  foreignKey: "community_id",
});

WikiCommunity.hasMany(WikiPageCommunity, {
  foreignKey: "community_id",
});
