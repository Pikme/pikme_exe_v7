CREATE TABLE `assignmentHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enquiryId` int NOT NULL,
	`assignedFrom` int,
	`assignedTo` int,
	`assignedBy` int NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assignmentHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `assignmentHistory_enquiryId_idx` ON `assignmentHistory` (`enquiryId`);--> statement-breakpoint
CREATE INDEX `assignmentHistory_assignedTo_idx` ON `assignmentHistory` (`assignedTo`);--> statement-breakpoint
CREATE INDEX `assignmentHistory_createdAt_idx` ON `assignmentHistory` (`createdAt`);