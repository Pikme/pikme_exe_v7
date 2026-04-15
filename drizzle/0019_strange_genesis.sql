CREATE TABLE `translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`language` enum('en','es','fr') NOT NULL,
	`value` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`lastModifiedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `translations_key_language_idx` ON `translations` (`key`,`language`);--> statement-breakpoint
CREATE INDEX `translations_category_idx` ON `translations` (`category`);--> statement-breakpoint
CREATE INDEX `translations_language_idx` ON `translations` (`language`);