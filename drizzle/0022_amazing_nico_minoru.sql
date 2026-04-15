CREATE TABLE `routingAudit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enquiryId` int NOT NULL,
	`routingRuleId` int,
	`assignedToUserId` int NOT NULL,
	`scoringDetails` json,
	`matchedCriteria` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `routingAudit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routingRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`priority` int NOT NULL DEFAULT 0,
	`tourCategoryId` int,
	`destinationPattern` varchar(100),
	`requiredLanguage` varchar(50),
	`minExperienceYears` int NOT NULL DEFAULT 0,
	`assignmentStrategy` enum('round_robin','least_loaded','expertise_match','random') NOT NULL DEFAULT 'least_loaded',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `routingRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamMemberAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentEnquiriesCount` int NOT NULL DEFAULT 0,
	`maxEnquiriesPerDay` int NOT NULL DEFAULT 20,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`unavailableUntil` timestamp,
	`lastAssignmentTime` timestamp,
	`averageResponseTime` int,
	`conversionRate` decimal(5,2),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamMemberAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamMemberExpertise` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tourCategoryId` int,
	`destination` varchar(100),
	`language` varchar(50),
	`proficiencyLevel` enum('beginner','intermediate','expert') NOT NULL DEFAULT 'intermediate',
	`yearsOfExperience` int NOT NULL DEFAULT 0,
	`maxConcurrentEnquiries` int NOT NULL DEFAULT 10,
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamMemberExpertise_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `routingAudit_enquiryId_idx` ON `routingAudit` (`enquiryId`);--> statement-breakpoint
CREATE INDEX `routingAudit_assignedToUserId_idx` ON `routingAudit` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `routingAudit_createdAt_idx` ON `routingAudit` (`createdAt`);--> statement-breakpoint
CREATE INDEX `routingRules_tourCategoryId_idx` ON `routingRules` (`tourCategoryId`);--> statement-breakpoint
CREATE INDEX `routingRules_priority_idx` ON `routingRules` (`priority`);--> statement-breakpoint
CREATE INDEX `routingRules_isActive_idx` ON `routingRules` (`isActive`);--> statement-breakpoint
CREATE INDEX `teamMemberAvailability_userId_idx` ON `teamMemberAvailability` (`userId`);--> statement-breakpoint
CREATE INDEX `teamMemberAvailability_isAvailable_idx` ON `teamMemberAvailability` (`isAvailable`);--> statement-breakpoint
CREATE INDEX `teamMemberExpertise_userId_idx` ON `teamMemberExpertise` (`userId`);--> statement-breakpoint
CREATE INDEX `teamMemberExpertise_tourCategoryId_idx` ON `teamMemberExpertise` (`tourCategoryId`);--> statement-breakpoint
CREATE INDEX `teamMemberExpertise_destination_idx` ON `teamMemberExpertise` (`destination`);--> statement-breakpoint
CREATE INDEX `teamMemberExpertise_language_idx` ON `teamMemberExpertise` (`language`);