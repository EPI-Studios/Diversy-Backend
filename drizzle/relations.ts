import { relations } from "drizzle-orm/relations";
import { users, privateMessages, subdomains } from "./schema";

export const privateMessagesRelations = relations(
  privateMessages,
  ({ one }) => ({
    user_receiverId: one(users, {
      fields: [privateMessages.receiverId],
      references: [users.id],
      relationName: "privateMessages_receiverId_users_id",
    }),
    user_senderId: one(users, {
      fields: [privateMessages.senderId],
      references: [users.id],
      relationName: "privateMessages_senderId_users_id",
    }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  privateMessages_receiverId: many(privateMessages, {
    relationName: "privateMessages_receiverId_users_id",
  }),
  privateMessages_senderId: many(privateMessages, {
    relationName: "privateMessages_senderId_users_id",
  }),
  subdomains: many(subdomains),
}));

export const subdomainsRelations = relations(subdomains, ({ one }) => ({
  user: one(users, {
    fields: [subdomains.initiatorId],
    references: [users.id],
  }),
}));
