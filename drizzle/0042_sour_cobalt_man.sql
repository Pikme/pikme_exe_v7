CREATE TABLE `abAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experimentId` int NOT NULL,
	`userId` int,
	`sessionId` varchar(255) NOT NULL,
	`variant` varchar(100) NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `abEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experimentId` int NOT NULL,
	`assignmentId` int NOT NULL,
	`userId` int,
	`sessionId` varchar(255) NOT NULL,
	`eventType` enum('view','click','conversion','engagement') NOT NULL,
	`eventName` varchar(255) NOT NULL,
	`locationId` int,
	`metadata` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `abExperiments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`experimentType` enum('ranking','ui','algorithm') NOT NULL,
	`controlVariant` varchar(100) NOT NULL,
	`treatmentVariant` varchar(100) NOT NULL,
	`status` enum('draft','running','paused','completed') NOT NULL DEFAULT 'draft',
	`trafficAllocation` int NOT NULL DEFAULT 50,
	`startDate` timestamp,
	`endDate` timestamp,
	`minSampleSize` int NOT NULL DEFAULT 1000,
	`confidenceLevel` decimal(3,2) NOT NULL DEFAULT 0.95,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abExperiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `abResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experimentId` int NOT NULL,
	`controlSampleSize` int NOT NULL DEFAULT 0,
	`treatmentSampleSize` int NOT NULL DEFAULT 0,
	`controlConversions` int NOT NULL DEFAULT 0,
	`treatmentConversions` int NOT NULL DEFAULT 0,
	`controlConversionRate` decimal(5,4) NOT NULL DEFAULT 0,
	`treatmentConversionRate` decimal(5,4) NOT NULL DEFAULT 0,
	`controlClickThroughRate` decimal(5,4) NOT NULL DEFAULT 0,
	`treatmentClickThroughRate` decimal(5,4) NOT NULL DEFAULT 0,
	`controlAvgEngagementScore` decimal(5,2) NOT NULL DEFAULT 0,
	`treatmentAvgEngagementScore` decimal(5,2) NOT NULL DEFAULT 0,
	`uplift` decimal(6,2),
	`pValue` decimal(5,4),
	`isStatisticallySignificant` boolean NOT NULL DEFAULT false,
	`confidenceInterval` json,
	`winner` enum('control','treatment','inconclusive') NOT NULL DEFAULT 'inconclusive',
	`computedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featureFlags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`enabled` boolean NOT NULL DEFAULT false,
	`rolloutPercentage` int NOT NULL DEFAULT 0,
	`linkedExperimentId` int,
	`targetUsers` json,
	`targetCountries` json,
	`targetLocations` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featureFlags_id` PRIMARY KEY(`id`),
	CONSTRAINT `featureFlags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE INDEX `abAssignments_experimentId_idx` ON `abAssignments` (`experimentId`);--> statement-breakpoint
CREATE INDEX `abAssignments_userId_idx` ON `abAssignments` (`userId`);--> statement-breakpoint
CREATE INDEX `abAssignments_sessionId_idx` ON `abAssignments` (`sessionId`);--> statement-breakpoint
CREATE INDEX `abAssignments_variant_idx` ON `abAssignments` (`variant`);--> statement-breakpoint
CREATE INDEX `abAssignments_experimentId_userId_idx` ON `abAssignments` (`experimentId`,`userId`);--> statement-breakpoint
CREATE INDEX `abEvents_experimentId_idx` ON `abEvents` (`experimentId`);--> statement-breakpoint
CREATE INDEX `abEvents_assignmentId_idx` ON `abEvents` (`assignmentId`);--> statement-breakpoint
CREATE INDEX `abEvents_userId_idx` ON `abEvents` (`userId`);--> statement-breakpoint
CREATE INDEX `abEvents_sessionId_idx` ON `abEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `abEvents_eventType_idx` ON `abEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `abEvents_locationId_idx` ON `abEvents` (`locationId`);--> statement-breakpoint
CREATE INDEX `abEvents_timestamp_idx` ON `abEvents` (`timestamp`);--> statement-breakpoint
CREATE INDEX `abExperiments_status_idx` ON `abExperiments` (`status`);--> statement-breakpoint
CREATE INDEX `abExperiments_experimentType_idx` ON `abExperiments` (`experimentType`);--> statement-breakpoint
CREATE INDEX `abExperiments_createdBy_idx` ON `abExperiments` (`createdBy`);--> statement-breakpoint
CREATE INDEX `abExperiments_createdAt_idx` ON `abExperiments` (`createdAt`);--> statement-breakpoint
CREATE INDEX `abResults_experimentId_idx` ON `abResults` (`experimentId`);--> statement-breakpoint
CREATE INDEX `abResults_winner_idx` ON `abResults` (`winner`);--> statement-breakpoint
CREATE INDEX `abResults_computedAt_idx` ON `abResults` (`computedAt`);--> statement-breakpoint
CREATE INDEX `featureFlags_name_idx` ON `featureFlags` (`name`);--> statement-breakpoint
CREATE INDEX `featureFlags_enabled_idx` ON `featureFlags` (`enabled`);--> statement-breakpoint
CREATE INDEX `featureFlags_linkedExperimentId_idx` ON `featureFlags` (`linkedExperimentId`);--> statement-breakpoint
CREATE INDEX `featureFlags_createdBy_idx` ON `featureFlags` (`createdBy`);