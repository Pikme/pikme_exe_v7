CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`icon` varchar(50),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`image` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `states_id` PRIMARY KEY(`id`),
	CONSTRAINT `states_countryId_slug_unique` UNIQUE(`countryId`,`slug`)
);
--> statement-breakpoint
DROP TABLE `sitemapEntries`;--> statement-breakpoint
DROP TABLE `tourLocations`;--> statement-breakpoint
ALTER TABLE `locations` DROP INDEX `locations_countryId_slug_unique`;--> statement-breakpoint
DROP INDEX `locations_countryId_idx` ON `locations`;--> statement-breakpoint
DROP INDEX `tours_category_idx` ON `tours`;--> statement-breakpoint
ALTER TABLE `seoMetadata` MODIFY COLUMN `contentType` enum('tour','location','country','state','category') NOT NULL;--> statement-breakpoint
ALTER TABLE `locations` ADD `stateId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` ADD `locationId` int;--> statement-breakpoint
ALTER TABLE `tours` ADD `categoryId` int;--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_stateId_slug_unique` UNIQUE(`stateId`,`slug`);--> statement-breakpoint
CREATE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `states_countryId_idx` ON `states` (`countryId`);--> statement-breakpoint
CREATE INDEX `states_slug_idx` ON `states` (`slug`);--> statement-breakpoint
CREATE INDEX `locations_stateId_idx` ON `locations` (`stateId`);--> statement-breakpoint
CREATE INDEX `tours_locationId_idx` ON `tours` (`locationId`);--> statement-breakpoint
CREATE INDEX `tours_categoryId_idx` ON `tours` (`categoryId`);--> statement-breakpoint
ALTER TABLE `locations` DROP COLUMN `countryId`;--> statement-breakpoint
ALTER TABLE `tours` DROP COLUMN `category`;