CREATE TABLE `destinationGalleryCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinationGalleryCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `destinationGalleryCategories_displayOrder_idx` ON `destinationGalleryCategories` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `destinationGalleryCategories_isActive_idx` ON `destinationGalleryCategories` (`isActive`);