CREATE TABLE `destinationGallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardNumber` int NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinationGallery_id` PRIMARY KEY(`id`),
	CONSTRAINT `destinationGallery_cardNumber_unique` UNIQUE(`cardNumber`)
);
--> statement-breakpoint
CREATE INDEX `destinationGallery_cardNumber_idx` ON `destinationGallery` (`cardNumber`);