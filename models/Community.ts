import { INTEGER, Model, STRING } from "sequelize";
import sequelize from "../utils/db";

export default class Community extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public owner_id!: number;
  public created_at!: number;
  public icon_url!: string | null;
  public updated_at!: number;
  public banner_url!: string | null;
}

Community.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: STRING,
      allowNull: true,
    },
    owner_id: {
      type: INTEGER,
      allowNull: false,
    },
    created_at: {
      type: INTEGER,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
    icon_url: {
      type: STRING,
      allowNull: true,
    },
    banner_url: {
      type: STRING,
      allowNull: true,
    },
    updated_at: {
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
