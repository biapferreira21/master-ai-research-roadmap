import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const lessonPdfs = sqliteTable("lesson_pdfs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  fileName: text("file_name").notNull(),
  objectKey: text("object_key").notNull(),
  contentType: text("content_type").notNull().default("application/pdf"),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_lesson_pdfs_object_key").on(table.objectKey),
  index("idx_lesson_pdfs_user_lesson").on(table.userId, table.lessonId),
]);

export const libraryItemState = sqliteTable("library_item_state", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  itemId: text("item_id").notNull(),
  favourite: integer("favourite", { mode: "boolean" }).notNull().default(false),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  notes: text("notes").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_library_item_state_user_item").on(table.userId, table.itemId),
  index("idx_library_item_state_user").on(table.userId),
]);

export const customLibrarySources = sqliteTable("custom_library_sources", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  section: text("section").notNull(),
  description: text("description").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  format: text("format").notNull().default("reference"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_custom_library_sources_user_section").on(table.userId, table.section),
]);
