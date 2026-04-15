CREATE TABLE `attractionAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attractionId` int NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`views` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`averageRating` decimal(3,2) DEFAULT 0,
	`totalReviews` int NOT NULL DEFAULT 0,
	`favoriteCount` int NOT NULL DEFAULT 0,
	`shareCount` int NOT NULL DEFAULT 0,
	`bookingCount` int NOT NULL DEFAULT 0,
	`conversionRate` decimal(5,2) DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attractionAnalytics_id` PRIMARY KEY(`id`),
	CONSTRAINT `attractionAnalytics_attractionId_date_unique` UNIQUE(`attractionId`,`date`)
);
--> statement-breakpoint
CREATE INDEX `attractionAnalytics_attractionId_idx` ON `attractionAnalytics` (`attractionId`);--> statement-breakpoint
CREATE INDEX `attractionAnalytics_date_idx` ON `attractionAnalytics` (`date`);