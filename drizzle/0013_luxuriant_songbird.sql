CREATE TABLE `categoryLocalizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`locale` varchar(10) NOT NULL,
	`title` varchar(200),
	`description` text,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`isComplete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categoryLocalizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `categoryLocalizations_categoryId_locale_unique` UNIQUE(`categoryId`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `stateLocalizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stateId` int NOT NULL,
	`locale` varchar(10) NOT NULL,
	`title` varchar(200),
	`description` text,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`isComplete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stateLocalizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `stateLocalizations_stateId_locale_unique` UNIQUE(`stateId`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `tourLocalizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`locale` varchar(10) NOT NULL,
	`title` varchar(200),
	`description` text,
	`longDescription` text,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`highlights` json,
	`itinerary` json,
	`inclusions` json,
	`exclusions` json,
	`bestTime` varchar(100),
	`cancellationPolicy` text,
	`paymentPolicy` text,
	`importantNotes` text,
	`faqs` json,
	`headingH1` varchar(200),
	`headingH2` varchar(200),
	`headingH3` varchar(200),
	`amenities` json,
	`transport` json,
	`isComplete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tourLocalizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `tourLocalizations_tourId_locale_unique` UNIQUE(`tourId`,`locale`)
);
--> statement-breakpoint
CREATE INDEX `categoryLocalizations_categoryId_idx` ON `categoryLocalizations` (`categoryId`);--> statement-breakpoint
CREATE INDEX `categoryLocalizations_locale_idx` ON `categoryLocalizations` (`locale`);--> statement-breakpoint
CREATE INDEX `stateLocalizations_stateId_idx` ON `stateLocalizations` (`stateId`);--> statement-breakpoint
CREATE INDEX `stateLocalizations_locale_idx` ON `stateLocalizations` (`locale`);--> statement-breakpoint
CREATE INDEX `tourLocalizations_tourId_idx` ON `tourLocalizations` (`tourId`);--> statement-breakpoint
CREATE INDEX `tourLocalizations_locale_idx` ON `tourLocalizations` (`locale`);