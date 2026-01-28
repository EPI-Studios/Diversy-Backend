import { INTEGER, Model, STRING } from "sequelize";
import Community from "./Community";
import sequelize from "../utils/db";

export default class WikiCommunity extends Model {}

WikiCommunity.init(
  {
    main_content: {
      type: STRING,
      allowNull: false,
      defaultValue: "{}",
    },
    community_id: {
      type: INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  { sequelize },
);

Community.hasOne(WikiCommunity, {
  foreignKey: "community_id",
});
WikiCommunity.belongsTo(Community, {
  foreignKey: "community_id",
});
