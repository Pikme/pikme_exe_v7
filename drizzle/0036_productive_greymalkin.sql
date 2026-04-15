CREATE TABLE `webhookAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookEndpointId` varchar(64) NOT NULL,
	`action` enum('create','update','delete','activate','deactivate','pause','resume','test') NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255),
	`previousState` json,
	`newState` json,
	`reason` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `webhookAuditLog_webhookEndpointId_idx` ON `webhookAuditLog` (`webhookEndpointId`);--> statement-breakpoint
CREATE INDEX `webhookAuditLog_action_idx` ON `webhookAuditLog` (`action`);--> statement-breakpoint
CREATE INDEX `webhookAuditLog_userId_idx` ON `webhookAuditLog` (`userId`);--> statement-breakpoint
CREATE INDEX `webhookAuditLog_createdAt_idx` ON `webhookAuditLog` (`createdAt`);