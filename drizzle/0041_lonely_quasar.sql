CREATE TABLE `autoTaggingConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`confidenceThreshold` decimal(3,2) NOT NULL DEFAULT 0.75,
	`autoApplyEnabled` boolean NOT NULL DEFAULT false,
	`filterByCountry` varchar(100),
	`filterByState` varchar(100),
	`filterByTags` json,
	`maxTagsPerLocation` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autoTaggingConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autoTaggingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`operationType` enum('preview','execute','undo') NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`totalLocations` int NOT NULL DEFAULT 0,
	`processedLocations` int NOT NULL DEFAULT 0,
	`tagsApplied` int NOT NULL DEFAULT 0,
	`tagsRemoved` int NOT NULL DEFAULT 0,
	`confidenceThreshold` decimal(3,2) NOT NULL,
	`affectedLocationIds` json,
	`appliedTags` json,
	`errors` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autoTaggingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `autoTaggingConfigs_userId_idx` ON `autoTaggingConfigs` (`userId`);--> statement-breakpoint
CREATE INDEX `autoTaggingHistory_userId_idx` ON `autoTaggingHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `autoTaggingHistory_status_idx` ON `autoTaggingHistory` (`status`);--> statement-breakpoint
CREATE INDEX `autoTaggingHistory_operationType_idx` ON `autoTaggingHistory` (`operationType`);--> statement-breakpoint
CREATE INDEX `autoTaggingHistory_createdAt_idx` ON `autoTaggingHistory` (`createdAt`);