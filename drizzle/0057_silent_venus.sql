CREATE TABLE `coreServices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(255) NOT NULL,
	`imageUrl` varchar(1024),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coreServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servicesCarouselImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`alt` varchar(255) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servicesCarouselImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `coreServices_displayOrder_idx` ON `coreServices` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `coreServices_isActive_idx` ON `coreServices` (`isActive`);--> statement-breakpoint
CREATE INDEX `servicesCarouselImages_displayOrder_idx` ON `servicesCarouselImages` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `servicesCarouselImages_isActive_idx` ON `servicesCarouselImages` (`isActive`);