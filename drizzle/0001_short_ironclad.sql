CREATE TABLE `custom_library_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`section` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`format` text DEFAULT 'reference' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_custom_library_sources_user_section` ON `custom_library_sources` (`user_id`,`section`);--> statement-breakpoint
CREATE TABLE `library_item_state` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`favourite` integer DEFAULT false NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_library_item_state_user_item` ON `library_item_state` (`user_id`,`item_id`);--> statement-breakpoint
CREATE INDEX `idx_library_item_state_user` ON `library_item_state` (`user_id`);