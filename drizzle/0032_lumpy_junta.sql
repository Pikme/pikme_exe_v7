CREATE TABLE `adminAuditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(100) NOT NULL,
	`userEmail` varchar(320),
	`action` enum('create','update','delete','view','export','import','login','logout') NOT NULL,
	`entityType` enum('tour','location','state','country','category','activity','attraction','user','system') NOT NULL,
	`entityId` int,
	`entityName` varchar(255),
	`description` text,
	`previousData` json,
	`newData` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminAuditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `adminAuditLogs_userId_idx` ON `adminAuditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `adminAuditLogs_action_idx` ON `adminAuditLogs` (`action`);--> statement-breakpoint
CREATE INDEX `adminAuditLogs_entityType_idx` ON `adminAuditLogs` (`entityType`);--> statement-breakpoint
CREATE INDEX `adminAuditLogs_createdAt_idx` ON `adminAuditLogs` (`createdAt`);