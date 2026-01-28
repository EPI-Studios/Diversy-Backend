import { BOOLEAN, INTEGER, Model, STRING } from "sequelize";
import sequelize from "../utils/db";
import User from "./User";

export default class Subdomain extends Model {}

Subdomain.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    initiator_id: {
      type: INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    name: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    validated: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    validated_at: {
      type: INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: INTEGER,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
  },
  {
    sequelize,
    timestamps: false,
  },
);
