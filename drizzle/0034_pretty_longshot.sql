CREATE TABLE `webhookEndpoints` (
	`id` varchar(64) NOT NULL,
	`url` varchar(500) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`events` json NOT NULL,
	`headers` json,
	`retryCount` int NOT NULL DEFAULT 3,
	`timeout` int NOT NULL DEFAULT 30000,
	`lastTriggeredAt` timestamp,
	`lastSuccessAt` timestamp,
	`lastErrorAt` timestamp,
	`lastErrorMessage` text,
	`failureCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhookEndpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookEndpointId` varchar(64) NOT NULL,
	`action` varchar(50) NOT NULL,
	`status` enum('pending','success','failed','retrying') NOT NULL DEFAULT 'pending',
	`statusCode` int,
	`errorMessage` text,
	`payload` json NOT NULL,
	`response` json,
	`attemptCount` int NOT NULL DEFAULT 1,
	`nextRetryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhookLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `webhookEndpoints_isActive_idx` ON `webhookEndpoints` (`isActive`);--> statement-breakpoint
CREATE INDEX `webhookEndpoints_createdAt_idx` ON `webhookEndpoints` (`createdAt`);--> statement-breakpoint
CREATE INDEX `webhookLogs_webhookEndpointId_idx` ON `webhookLogs` (`webhookEndpointId`);--> statement-breakpoint
CREATE INDEX `webhookLogs_status_idx` ON `webhookLogs` (`status`);--> statement-breakpoint
CREATE INDEX `webhookLogs_createdAt_idx` ON `webhookLogs` (`createdAt`);