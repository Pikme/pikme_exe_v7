CREATE TABLE `destinationGalleryCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(1024) NOT NULL,
	`destinationLink` varchar(1024) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinationGalleryCards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `destinationGallerySettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionTitle` varchar(255) NOT NULL DEFAULT 'Destination Gallery',
	`sectionDescription` text NOT NULL DEFAULT ('Explore amazing destinations across India and beyond'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinationGallerySettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `destinationGalleryCards_displayOrder_idx` ON `destinationGalleryCards` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `destinationGalleryCards_isActive_idx` ON `destinationGalleryCards` (`isActive`);