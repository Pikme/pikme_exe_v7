CREATE TABLE `notificationActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('accept','defer','reassign','mark_read','dismiss') NOT NULL,
	`actionData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificationActions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enquiryAssignedEmail` boolean NOT NULL DEFAULT true,
	`enquiryAssignedInApp` boolean NOT NULL DEFAULT true,
	`enquiryUpdatedEmail` boolean NOT NULL DEFAULT true,
	`enquiryUpdatedInApp` boolean NOT NULL DEFAULT true,
	`enquiryCompletedEmail` boolean NOT NULL DEFAULT false,
	`enquiryCompletedInApp` boolean NOT NULL DEFAULT true,
	`teamMessageEmail` boolean NOT NULL DEFAULT true,
	`teamMessageInApp` boolean NOT NULL DEFAULT true,
	`systemAlertEmail` boolean NOT NULL DEFAULT false,
	`systemAlertInApp` boolean NOT NULL DEFAULT true,
	`quietHoursStart` varchar(5),
	`quietHoursEnd` varchar(5),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('enquiry_assigned','enquiry_updated','enquiry_completed','team_message','system_alert') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`enquiryId` int,
	`actionUrl` varchar(500),
	`actionLabel` varchar(100),
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `notificationActions_notificationId_idx` ON `notificationActions` (`notificationId`);--> statement-breakpoint
CREATE INDEX `notificationActions_userId_idx` ON `notificationActions` (`userId`);--> statement-breakpoint
CREATE INDEX `notificationActions_createdAt_idx` ON `notificationActions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `notificationPreferences_userId_idx` ON `notificationPreferences` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_enquiryId_idx` ON `notifications` (`enquiryId`);--> statement-breakpoint
CREATE INDEX `notifications_isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`createdAt`);