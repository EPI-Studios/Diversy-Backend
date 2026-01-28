import { BOOLEAN, INTEGER, Model, STRING } from "sequelize";
import sequelize from "../utils/db";
import createToken from "../utils/token";

export default class User extends Model {}

User.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: STRING,
      allowNull: false,
    },
    avatar_url: {
      type: STRING,
      allowNull: true,
    },
    token: {
      type: STRING,
      allowNull: false,
      defaultValue: () => createToken(),
    },
    custom_css: {
      type: STRING,
      allowNull: true,
    },
    banner_url: {
      type: STRING,
      allowNull: true,
    },
    created_at: {
      type: INTEGER,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
    updated_at: {
      type: INTEGER,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
    admin: {
      type: BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    timestamps: false,
  },
); // No password because it's email code verification only
