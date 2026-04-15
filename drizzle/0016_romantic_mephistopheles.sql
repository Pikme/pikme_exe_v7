CREATE TABLE `importRollbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importLogId` int NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('attractions','tours','locations','flights','activities') NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`recordId` int NOT NULL,
	`previousData` json,
	`newData` json,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `importRollbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rollbackLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importLogId` int NOT NULL,
	`userId` int NOT NULL,
	`totalRollbacks` int NOT NULL,
	`successfulRollbacks` int NOT NULL,
	`failedRollbacks` int NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errors` json,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `rollbackLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `importRollbacks_importLogId_idx` ON `importRollbacks` (`importLogId`);--> statement-breakpoint
CREATE INDEX `importRollbacks_userId_idx` ON `importRollbacks` (`userId`);--> statement-breakpoint
CREATE INDEX `importRollbacks_entityType_idx` ON `importRollbacks` (`entityType`);--> statement-breakpoint
CREATE INDEX `importRollbacks_status_idx` ON `importRollbacks` (`status`);--> statement-breakpoint
CREATE INDEX `rollbackLogs_importLogId_idx` ON `rollbackLogs` (`importLogId`);--> statement-breakpoint
CREATE INDEX `rollbackLogs_userId_idx` ON `rollbackLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `rollbackLogs_status_idx` ON `rollbackLogs` (`status`);