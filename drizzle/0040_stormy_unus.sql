CREATE TABLE `locationTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `locationTags_id` PRIMARY KEY(`id`),
	CONSTRAINT `locationTags_locationId_tagId_unique` UNIQUE(`locationId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`color` varchar(7) DEFAULT '#3B82F6',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`),
	CONSTRAINT `tags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `locationTags_locationId_idx` ON `locationTags` (`locationId`);--> statement-breakpoint
CREATE INDEX `locationTags_tagId_idx` ON `locationTags` (`tagId`);--> statement-breakpoint
CREATE INDEX `tags_slug_idx` ON `tags` (`slug`);