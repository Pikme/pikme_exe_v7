CREATE TABLE `bodyImageCarousel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`title` varchar(255),
	`description` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bodyImageCarousel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bodyImageCarousel_displayOrder_idx` ON `bodyImageCarousel` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `bodyImageCarousel_isActive_idx` ON `bodyImageCarousel` (`isActive`);