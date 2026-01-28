import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import createCode from "../utils/code";
import createToken from "../utils/token";

export const users = sqliteTable("Users", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text({ length: 255 }).notNull(),
  username: text({ length: 255 }).notNull(),
  displayName: text("display_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url", { length: 255 }).$defaultFn(
    () => "/guest-avatar.png",
  ),
  token: text({ length: 255 })
    .notNull()
    .$defaultFn(() => createToken()),
  customCss: text("custom_css", { length: 255 }),
  bannerUrl: text("banner_url", { length: 255 }),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  admin: integer().default(0),
});

export const codes = sqliteTable("Codes", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text({ length: 255 }).notNull(),
  code: text({ length: 255 })
    .notNull()
    .$defaultFn(() => createCode()),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const communities = sqliteTable("Communities", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text({ length: 255 }).notNull(),
  description: text({ length: 255 }),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  iconUrl: text("icon_url", { length: 255 }),
  bannerUrl: text("banner_url", { length: 255 }),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const privateMessages = sqliteTable("PrivateMessages", {
  id: integer().primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  content: text({ length: 255 }).notNull(),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const subdomains = sqliteTable("Subdomains", {
  id: integer().primaryKey({ autoIncrement: true }),
  initiatorId: integer("initiator_id")
    .notNull()
    .references(() => users.id),
  name: text({ length: 255 }).notNull(),
  validated: integer().default(0).notNull(),
  validatedAt: integer("validated_at"),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});
