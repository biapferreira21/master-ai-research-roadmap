CREATE TABLE `lesson_pdfs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`file_name` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text DEFAULT 'application/pdf' NOT NULL,
	`size` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lesson_pdfs_object_key` ON `lesson_pdfs` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_lesson_pdfs_user_lesson` ON `lesson_pdfs` (`user_id`,`lesson_id`);