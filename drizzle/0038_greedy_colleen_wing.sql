CREATE TABLE `schedulerAlertConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('check_failure','check_stall','consecutive_errors','rotation_failure','job_stall') NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`threshold` int NOT NULL,
	`notifyAdmins` boolean NOT NULL DEFAULT true,
	`notifyEmail` varchar(255),
	`cooldownMinutes` int NOT NULL DEFAULT 60,
	`lastAlertTime` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedulerAlertConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedulerAlertHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('check_failure','check_stall','consecutive_errors','rotation_failure','job_stall') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`message` text NOT NULL,
	`details` json,
	`notified` boolean NOT NULL DEFAULT false,
	`notificationTime` timestamp,
	`acknowledged` boolean NOT NULL DEFAULT false,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `schedulerAlertHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `schedulerAlertConfig_alertType_idx` ON `schedulerAlertConfig` (`alertType`);--> statement-breakpoint
CREATE INDEX `schedulerAlertConfig_enabled_idx` ON `schedulerAlertConfig` (`enabled`);--> statement-breakpoint
CREATE INDEX `schedulerAlertHistory_alertType_idx` ON `schedulerAlertHistory` (`alertType`);--> statement-breakpoint
CREATE INDEX `schedulerAlertHistory_severity_idx` ON `schedulerAlertHistory` (`severity`);--> statement-breakpoint
CREATE INDEX `schedulerAlertHistory_notified_idx` ON `schedulerAlertHistory` (`notified`);--> statement-breakpoint
CREATE INDEX `schedulerAlertHistory_acknowledged_idx` ON `schedulerAlertHistory` (`acknowledged`);--> statement-breakpoint
CREATE INDEX `schedulerAlertHistory_createdAt_idx` ON `schedulerAlertHistory` (`createdAt`);