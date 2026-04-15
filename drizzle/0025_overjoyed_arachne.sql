CREATE TABLE `reportDeliveries` (
	`id` varchar(32) NOT NULL,
	`scheduleId` varchar(32) NOT NULL,
	`recipients` json NOT NULL,
	`subject` text NOT NULL,
	`status` text NOT NULL,
	`reportData` json,
	`attachmentUrl` text,
	`attachmentFormat` text,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`lastRetryAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportDeliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportSchedules` (
	`id` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`frequency` text NOT NULL,
	`dayOfWeek` int,
	`dayOfMonth` int,
	`time` text NOT NULL,
	`timezone` text DEFAULT ('UTC'),
	`reportType` text NOT NULL,
	`dateRangeType` text NOT NULL,
	`customDaysBack` int,
	`recipients` json NOT NULL,
	`includeAttachment` boolean DEFAULT true,
	`attachmentFormat` text DEFAULT ('csv'),
	`isActive` boolean DEFAULT true,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reportDeliveries` ADD CONSTRAINT `reportDeliveries_scheduleId_reportSchedules_id_fk` FOREIGN KEY (`scheduleId`) REFERENCES `reportSchedules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportSchedules` ADD CONSTRAINT `reportSchedules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `reportDeliveries_scheduleId_idx` ON `reportDeliveries` (`scheduleId`);--> statement-breakpoint
CREATE INDEX `reportDeliveries_status_idx` ON `reportDeliveries` (`status`);--> statement-breakpoint
CREATE INDEX `reportDeliveries_createdAt_idx` ON `reportDeliveries` (`createdAt`);--> statement-breakpoint
CREATE INDEX `reportSchedules_userId_idx` ON `reportSchedules` (`userId`);--> statement-breakpoint
CREATE INDEX `reportSchedules_frequency_idx` ON `reportSchedules` (`frequency`);--> statement-breakpoint
CREATE INDEX `reportSchedules_nextRunAt_idx` ON `reportSchedules` (`nextRunAt`);
