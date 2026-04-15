CREATE TABLE `attractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`type` enum('landmark','restaurant','museum','temple','monument','park','cafe','shopping','other') NOT NULL,
	`description` text,
	`address` varchar(500),
	`phone` varchar(20),
	`email` varchar(100),
	`website` varchar(500),
	`openingHours` varchar(100),
	`closedOn` varchar(100),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`image` varchar(500),
	`images` json,
	`rating` decimal(3,2),
	`reviewCount` int DEFAULT 0,
	`entryFee` varchar(100),
	`estimatedVisitTime` varchar(100),
	`bestTimeToVisit` varchar(200),
	`highlights` json,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`isActive` boolean DEFAULT true,
	`isFeatured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attractions_id` PRIMARY KEY(`id`),
	CONSTRAINT `attractions_locationId_slug_unique` UNIQUE(`locationId`,`slug`)
);
--> statement-breakpoint
CREATE INDEX `attractions_locationId_idx` ON `attractions` (`locationId`);--> statement-breakpoint
CREATE INDEX `attractions_type_idx` ON `attractions` (`type`);--> statement-breakpoint
CREATE INDEX `attractions_slug_idx` ON `attractions` (`slug`);