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
    senderId: {
      type: INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    receiverId: {
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
    createdAt: {
      type: INTEGER,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
    updatedAt: {
      type: INTEGER,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
  },
  {
    sequelize,
  },
);
