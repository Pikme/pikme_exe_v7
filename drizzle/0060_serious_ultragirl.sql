CREATE TABLE `featuredDestinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featuredDestinations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewWidgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(100) NOT NULL,
	`starRating` decimal(3,1) NOT NULL,
	`reviewCount` int NOT NULL DEFAULT 0,
	`reviewLink` varchar(1024) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviewWidgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviewWidgets_platform_unique` UNIQUE(`platform`)
);
--> statement-breakpoint
CREATE INDEX `featuredDestinations_displayOrder_idx` ON `featuredDestinations` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `featuredDestinations_isActive_idx` ON `featuredDestinations` (`isActive`);--> statement-breakpoint
CREATE INDEX `reviewWidgets_platform_idx` ON `reviewWidgets` (`platform`);--> statement-breakpoint
CREATE INDEX `reviewWidgets_isActive_idx` ON `reviewWidgets` (`isActive`);