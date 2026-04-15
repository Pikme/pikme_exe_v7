CREATE TABLE `emailDeliveryTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailHistoryId` int NOT NULL,
	`deliveryStatus` enum('queued','sent','delivered','bounced','complained','suppressed') NOT NULL DEFAULT 'sent',
	`bounceType` enum('permanent','temporary','undetermined'),
	`bounceSubType` varchar(50),
	`complaintType` varchar(50),
	`opens` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`lastOpenedAt` timestamp,
	`lastClickedAt` timestamp,
	`firstOpenedAt` timestamp,
	`firstClickedAt` timestamp,
	`trackingData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailDeliveryTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateType` enum('enquiry_assigned','enquiry_updated','enquiry_completed','team_message','system_alert') NOT NULL,
	`scenario` varchar(50),
	`subject` varchar(255) NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientName` varchar(255),
	`senderUserId` int NOT NULL,
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'sent',
	`errorMessage` text,
	`htmlSize` int,
	`textSize` int,
	`templateData` json,
	`metadata` json,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailStatistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateType` enum('enquiry_assigned','enquiry_updated','enquiry_completed','team_message','system_alert') NOT NULL,
	`totalSent` int NOT NULL DEFAULT 0,
	`totalDelivered` int NOT NULL DEFAULT 0,
	`totalBounced` int NOT NULL DEFAULT 0,
	`totalOpened` int NOT NULL DEFAULT 0,
	`totalClicked` int NOT NULL DEFAULT 0,
	`totalComplained` int NOT NULL DEFAULT 0,
	`openRate` decimal(5,2) DEFAULT 0,
	`clickRate` decimal(5,2) DEFAULT 0,
	`bounceRate` decimal(5,2) DEFAULT 0,
	`complaintRate` decimal(5,2) DEFAULT 0,
	`averageOpenTime` int,
	`averageClickTime` int,
	`lastCalculatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailStatistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `emailDeliveryTracking_emailHistoryId_idx` ON `emailDeliveryTracking` (`emailHistoryId`);--> statement-breakpoint
CREATE INDEX `emailDeliveryTracking_deliveryStatus_idx` ON `emailDeliveryTracking` (`deliveryStatus`);--> statement-breakpoint
CREATE INDEX `emailDeliveryTracking_createdAt_idx` ON `emailDeliveryTracking` (`createdAt`);--> statement-breakpoint
CREATE INDEX `emailHistory_templateType_idx` ON `emailHistory` (`templateType`);--> statement-breakpoint
CREATE INDEX `emailHistory_recipientEmail_idx` ON `emailHistory` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `emailHistory_senderUserId_idx` ON `emailHistory` (`senderUserId`);--> statement-breakpoint
CREATE INDEX `emailHistory_status_idx` ON `emailHistory` (`status`);--> statement-breakpoint
CREATE INDEX `emailHistory_sentAt_idx` ON `emailHistory` (`sentAt`);--> statement-breakpoint
CREATE INDEX `emailHistory_createdAt_idx` ON `emailHistory` (`createdAt`);--> statement-breakpoint
CREATE INDEX `emailStatistics_templateType_idx` ON `emailStatistics` (`templateType`);--> statement-breakpoint
CREATE INDEX `emailStatistics_updatedAt_idx` ON `emailStatistics` (`updatedAt`);