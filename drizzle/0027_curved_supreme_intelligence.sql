CREATE TABLE `jobErrorDiagnostics` (
	`id` varchar(32) NOT NULL,
	`jobLogId` varchar(32) NOT NULL,
	`errorCode` varchar(50) NOT NULL,
	`errorMessage` text NOT NULL,
	`errorStack` text,
	`context` json,
	`isResolved` boolean DEFAULT false,
	`resolutionNotes` text,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobErrorDiagnostics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobExecutionLogs` (
	`id` varchar(32) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`queueName` varchar(50) NOT NULL,
	`jobType` varchar(50) NOT NULL,
	`status` enum('pending','processing','completed','failed','retried') NOT NULL,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`duration` int,
	`processingTime` int,
	`queueWaitTime` int,
	`jobData` json,
	`result` json,
	`errorMessage` text,
	`errorStack` text,
	`errorCode` varchar(50),
	`attemptNumber` int DEFAULT 1,
	`maxAttempts` int DEFAULT 3,
	`nextRetryAt` timestamp,
	`memoryUsed` int,
	`cpuUsed` decimal(5,2),
	`userId` int,
	`scheduleId` varchar(32),
	`deliveryId` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobExecutionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobPerformanceMetrics` (
	`id` varchar(32) NOT NULL,
	`queueName` varchar(50) NOT NULL,
	`jobType` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`hour` int,
	`totalJobs` int DEFAULT 0,
	`successfulJobs` int DEFAULT 0,
	`failedJobs` int DEFAULT 0,
	`retriedJobs` int DEFAULT 0,
	`averageDuration` decimal(10,2),
	`minDuration` int,
	`maxDuration` int,
	`averageProcessingTime` decimal(10,2),
	`averageQueueWaitTime` decimal(10,2),
	`successRate` decimal(5,2),
	`failureRate` decimal(5,2),
	`averageMemoryUsed` decimal(10,2),
	`averageCpuUsed` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobPerformanceMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `jobErrorDiagnostics` ADD CONSTRAINT `jobErrorDiagnostics_jobLogId_jobExecutionLogs_id_fk` FOREIGN KEY (`jobLogId`) REFERENCES `jobExecutionLogs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobErrorDiagnostics` ADD CONSTRAINT `jobErrorDiagnostics_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobExecutionLogs` ADD CONSTRAINT `jobExecutionLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `jobErrorDiagnostics_jobLogId_idx` ON `jobErrorDiagnostics` (`jobLogId`);--> statement-breakpoint
CREATE INDEX `jobErrorDiagnostics_errorCode_idx` ON `jobErrorDiagnostics` (`errorCode`);--> statement-breakpoint
CREATE INDEX `jobErrorDiagnostics_severity_idx` ON `jobErrorDiagnostics` (`severity`);--> statement-breakpoint
CREATE INDEX `jobErrorDiagnostics_createdAt_idx` ON `jobErrorDiagnostics` (`createdAt`);--> statement-breakpoint
CREATE INDEX `jobExecutionLogs_jobId_idx` ON `jobExecutionLogs` (`jobId`);--> statement-breakpoint
CREATE INDEX `jobExecutionLogs_queueName_idx` ON `jobExecutionLogs` (`queueName`);--> statement-breakpoint
CREATE INDEX `jobExecutionLogs_status_idx` ON `jobExecutionLogs` (`status`);--> statement-breakpoint
CREATE INDEX `jobExecutionLogs_createdAt_idx` ON `jobExecutionLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `jobExecutionLogs_scheduleId_idx` ON `jobExecutionLogs` (`scheduleId`);--> statement-breakpoint
CREATE INDEX `jobExecutionLogs_deliveryId_idx` ON `jobExecutionLogs` (`deliveryId`);--> statement-breakpoint
CREATE INDEX `jobPerformanceMetrics_queueName_idx` ON `jobPerformanceMetrics` (`queueName`);--> statement-breakpoint
CREATE INDEX `jobPerformanceMetrics_date_idx` ON `jobPerformanceMetrics` (`date`);--> statement-breakpoint
CREATE INDEX `jobPerformanceMetrics_hour_idx` ON `jobPerformanceMetrics` (`hour`);