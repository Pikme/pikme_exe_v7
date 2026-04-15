CREATE TABLE `emailEngagementMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailHistoryId` int NOT NULL,
	`emailDeliveryTrackingId` int,
	`openCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`uniqueOpenCount` int NOT NULL DEFAULT 0,
	`uniqueClickCount` int NOT NULL DEFAULT 0,
	`openRate` decimal(5,2) DEFAULT 0,
	`clickRate` decimal(5,2) DEFAULT 0,
	`clickThroughRate` decimal(5,2) DEFAULT 0,
	`bounceCount` int NOT NULL DEFAULT 0,
	`complaintCount` int NOT NULL DEFAULT 0,
	`firstOpenedAt` timestamp,
	`lastOpenedAt` timestamp,
	`firstClickedAt` timestamp,
	`lastClickedAt` timestamp,
	`engagementScore` decimal(5,2) DEFAULT 0,
	`linksClicked` json,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailEngagementMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailEngagementMetrics_emailHistoryId_unique` UNIQUE(`emailHistoryId`)
);
--> statement-breakpoint
CREATE TABLE `emailEngagementTrends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` varchar(32),
	`periodDate` date NOT NULL,
	`periodType` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
	`totalEmailsSent` int NOT NULL DEFAULT 0,
	`totalOpens` int NOT NULL DEFAULT 0,
	`totalClicks` int NOT NULL DEFAULT 0,
	`totalBounces` int NOT NULL DEFAULT 0,
	`totalComplaints` int NOT NULL DEFAULT 0,
	`averageOpenRate` decimal(5,2) DEFAULT 0,
	`averageClickRate` decimal(5,2) DEFAULT 0,
	`averageBounceRate` decimal(5,2) DEFAULT 0,
	`averageEngagementScore` decimal(5,2) DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailEngagementTrends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailEventTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailHistoryId` int NOT NULL,
	`emailDeliveryTrackingId` int,
	`eventType` enum('open','click','bounce','complaint','delivery','deferred','dropped','processed','sent') NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`userAgent` text,
	`ipAddress` varchar(45),
	`linkUrl` text,
	`linkText` varchar(255),
	`bounceType` enum('permanent','temporary','undetermined'),
	`bounceSubType` varchar(50),
	`complaintType` varchar(50),
	`complaintFeedbackType` varchar(50),
	`rawEventData` json,
	`eventTimestamp` timestamp NOT NULL,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailEventTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `emailEngagementMetrics_emailHistoryId_idx` ON `emailEngagementMetrics` (`emailHistoryId`);--> statement-breakpoint
CREATE INDEX `emailEngagementMetrics_emailDeliveryTrackingId_idx` ON `emailEngagementMetrics` (`emailDeliveryTrackingId`);--> statement-breakpoint
CREATE INDEX `emailEngagementMetrics_engagementScore_idx` ON `emailEngagementMetrics` (`engagementScore`);--> statement-breakpoint
CREATE INDEX `emailEngagementMetrics_lastUpdatedAt_idx` ON `emailEngagementMetrics` (`lastUpdatedAt`);--> statement-breakpoint
CREATE INDEX `emailEngagementTrends_scheduleId_idx` ON `emailEngagementTrends` (`scheduleId`);--> statement-breakpoint
CREATE INDEX `emailEngagementTrends_periodDate_idx` ON `emailEngagementTrends` (`periodDate`);--> statement-breakpoint
CREATE INDEX `emailEngagementTrends_periodType_idx` ON `emailEngagementTrends` (`periodType`);--> statement-breakpoint
CREATE INDEX `emailEventTracking_emailHistoryId_idx` ON `emailEventTracking` (`emailHistoryId`);--> statement-breakpoint
CREATE INDEX `emailEventTracking_emailDeliveryTrackingId_idx` ON `emailEventTracking` (`emailDeliveryTrackingId`);--> statement-breakpoint
CREATE INDEX `emailEventTracking_eventType_idx` ON `emailEventTracking` (`eventType`);--> statement-breakpoint
CREATE INDEX `emailEventTracking_recipientEmail_idx` ON `emailEventTracking` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `emailEventTracking_eventTimestamp_idx` ON `emailEventTracking` (`eventTimestamp`);--> statement-breakpoint
CREATE INDEX `emailEventTracking_createdAt_idx` ON `emailEventTracking` (`createdAt`);