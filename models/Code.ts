import { INTEGER, Model, STRING } from "sequelize";
import sequelize from "../utils/db";
import createCode from "../utils/code";

export default class Code extends Model {}

Code.init(
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
    code: {
      type: STRING,
      allowNull: false,
      defaultValue: () => {
        return createCode();
      },
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
