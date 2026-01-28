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
    initiatorId: {
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
    validatedAt: {
      type: INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: INTEGER,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
  },
  {
    sequelize,
  },
);
