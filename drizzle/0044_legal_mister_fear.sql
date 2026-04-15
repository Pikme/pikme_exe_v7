CREATE TABLE `activityImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityId` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`alt` varchar(255),
	`caption` varchar(255),
	`order` int DEFAULT 0,
	`isMain` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activityImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activityInclusions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityId` int NOT NULL,
	`item` varchar(255) NOT NULL,
	`type` enum('include','exclude') NOT NULL,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityInclusions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `activityImages_activityId_idx` ON `activityImages` (`activityId`);--> statement-breakpoint
CREATE INDEX `activityInclusions_activityId_idx` ON `activityInclusions` (`activityId`);