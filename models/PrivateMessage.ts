import { INTEGER, Model, STRING } from "sequelize";
import sequelize from "../utils/db";
import User from "./User";

export default class PrivateMessage extends Model {}

PrivateMessage.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    receiver_id: {
      type: INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    content: {
      type: STRING,
      allowNull: false,
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
  },
  {
    sequelize,
  },
);
