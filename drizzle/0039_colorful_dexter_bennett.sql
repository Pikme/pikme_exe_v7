CREATE TABLE `emailBounceList` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`bounceType` enum('permanent','temporary','complaint') NOT NULL,
	`bounceSubType` varchar(100),
	`bounceReason` text,
	`bounceCount` int NOT NULL DEFAULT 1,
	`lastBounceAt` timestamp NOT NULL,
	`suppressed` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailBounceList_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailBounceList_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `emailDeliveryLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`recipientEmail` varchar(255) NOT NULL,
	`messageId` varchar(255),
	`subject` text NOT NULL,
	`status` enum('pending','sent','failed','bounced','complained') NOT NULL DEFAULT 'pending',
	`statusCode` int,
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`maxRetries` int NOT NULL DEFAULT 3,
	`nextRetryAt` timestamp,
	`sentAt` timestamp,
	`bouncedAt` timestamp,
	`bounceType` enum('permanent','temporary','complaint'),
	`bounceSubType` varchar(100),
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailDeliveryLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailDeliveryStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`totalSent` int NOT NULL DEFAULT 0,
	`totalFailed` int NOT NULL DEFAULT 0,
	`totalBounced` int NOT NULL DEFAULT 0,
	`totalComplaints` int NOT NULL DEFAULT 0,
	`totalOpened` int NOT NULL DEFAULT 0,
	`totalClicked` int NOT NULL DEFAULT 0,
	`deliveryRate` decimal(5,2) DEFAULT '0',
	`bounceRate` decimal(5,2) DEFAULT '0',
	`complaintRate` decimal(5,2) DEFAULT '0',
	`openRate` decimal(5,2) DEFAULT '0',
	`clickRate` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailDeliveryStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `emailBounceList_email_idx` ON `emailBounceList` (`email`);--> statement-breakpoint
CREATE INDEX `emailBounceList_suppressed_idx` ON `emailBounceList` (`suppressed`);--> statement-breakpoint
CREATE INDEX `emailDeliveryLogs_alertId_idx` ON `emailDeliveryLogs` (`alertId`);--> statement-breakpoint
CREATE INDEX `emailDeliveryLogs_status_idx` ON `emailDeliveryLogs` (`status`);--> statement-breakpoint
CREATE INDEX `emailDeliveryLogs_recipientEmail_idx` ON `emailDeliveryLogs` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `emailDeliveryLogs_createdAt_idx` ON `emailDeliveryLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `emailDeliveryStats_date_idx` ON `emailDeliveryStats` (`date`);