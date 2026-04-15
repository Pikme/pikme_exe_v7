CREATE TABLE `validationIssues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`validationLogId` int NOT NULL,
	`ruleId` int NOT NULL,
	`entityType` enum('attraction','tour','location','activity') NOT NULL,
	`entityId` int NOT NULL,
	`field` varchar(100),
	`currentValue` text,
	`expectedValue` text,
	`severity` enum('info','warning','error') NOT NULL DEFAULT 'error',
	`message` text NOT NULL,
	`suggestedFix` text,
	`isResolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `validationIssues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `validationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`validationType` enum('attractions','tours','locations','all') NOT NULL DEFAULT 'all',
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`totalRecords` int NOT NULL DEFAULT 0,
	`validRecords` int NOT NULL DEFAULT 0,
	`invalidRecords` int NOT NULL DEFAULT 0,
	`warnings` int NOT NULL DEFAULT 0,
	`errors` json,
	`anomalies` json,
	`suggestedActions` json,
	`executionTime` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `validationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `validationRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`ruleType` enum('required_field','format_check','range_check','uniqueness','referential_integrity','anomaly_detection') NOT NULL,
	`entityType` enum('attraction','tour','location','activity') NOT NULL,
	`field` varchar(100),
	`config` json,
	`severity` enum('info','warning','error') NOT NULL DEFAULT 'error',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `validationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `validationIssues_validationLogId_idx` ON `validationIssues` (`validationLogId`);--> statement-breakpoint
CREATE INDEX `validationIssues_entity_idx` ON `validationIssues` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `validationIssues_severity_idx` ON `validationIssues` (`severity`);--> statement-breakpoint
CREATE INDEX `validationIssues_isResolved_idx` ON `validationIssues` (`isResolved`);--> statement-breakpoint
CREATE INDEX `validationLogs_validationType_idx` ON `validationLogs` (`validationType`);--> statement-breakpoint
CREATE INDEX `validationLogs_status_idx` ON `validationLogs` (`status`);--> statement-breakpoint
CREATE INDEX `validationLogs_createdAt_idx` ON `validationLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `validationRules_entityType_idx` ON `validationRules` (`entityType`);--> statement-breakpoint
CREATE INDEX `validationRules_isActive_idx` ON `validationRules` (`isActive`);