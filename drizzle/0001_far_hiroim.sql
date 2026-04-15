CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`tourId` int,
	`name` varchar(200) NOT NULL,
	`description` text,
	`category` varchar(50),
	`duration` varchar(50),
	`price` decimal(10,2),
	`currency` varchar(3) DEFAULT 'USD',
	`image` varchar(500),
	`difficulty` enum('easy','moderate','challenging'),
	`bestTime` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(2) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`image` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_code_unique` UNIQUE(`code`),
	CONSTRAINT `countries_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `flights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int,
	`fromLocation` varchar(100),
	`toLocation` varchar(100),
	`airline` varchar(100),
	`flightNumber` varchar(20),
	`departureTime` varchar(20),
	`arrivalTime` varchar(20),
	`price` decimal(10,2),
	`currency` varchar(3) DEFAULT 'USD',
	`duration` varchar(50),
	`stops` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `importLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`importType` enum('tours','locations','flights','activities') NOT NULL,
	`totalRecords` int NOT NULL,
	`successfulRecords` int NOT NULL,
	`failedRecords` int NOT NULL,
	`errors` json,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `importLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`image` varchar(500),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_countryId_slug_unique` UNIQUE(`countryId`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `seoMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('tour','location','country') NOT NULL,
	`contentId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` varchar(160) NOT NULL,
	`keywords` text,
	`ogImage` varchar(500),
	`canonicalUrl` varchar(500),
	`structuredData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seoMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sitemapEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(500) NOT NULL,
	`priority` decimal(2,1) DEFAULT '0.5',
	`changeFrequency` enum('always','hourly','daily','weekly','monthly','yearly','never') DEFAULT 'weekly',
	`lastModified` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sitemapEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `sitemapEntries_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `tourLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`locationId` int NOT NULL,
	`dayNumber` int,
	`sequence` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tourLocations_id` PRIMARY KEY(`id`),
	CONSTRAINT `tourLocations_tourId_locationId_unique` UNIQUE(`tourId`,`locationId`)
);
--> statement-breakpoint
CREATE TABLE `tours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`longDescription` text,
	`category` varchar(50),
	`duration` int,
	`price` decimal(10,2),
	`currency` varchar(3) DEFAULT 'USD',
	`image` varchar(500),
	`images` json,
	`metaTitle` varchar(160),
	`metaDescription` varchar(160),
	`metaKeywords` text,
	`highlights` json,
	`itinerary` json,
	`inclusions` json,
	`exclusions` json,
	`bestTime` varchar(100),
	`difficulty` enum('easy','moderate','challenging'),
	`groupSize` varchar(50),
	`isActive` boolean DEFAULT true,
	`isFeatured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tours_id` PRIMARY KEY(`id`),
	CONSTRAINT `tours_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `activities_locationId_idx` ON `activities` (`locationId`);--> statement-breakpoint
CREATE INDEX `activities_tourId_idx` ON `activities` (`tourId`);--> statement-breakpoint
CREATE INDEX `countries_slug_idx` ON `countries` (`slug`);--> statement-breakpoint
CREATE INDEX `flights_tourId_idx` ON `flights` (`tourId`);--> statement-breakpoint
CREATE INDEX `importLogs_userId_idx` ON `importLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `importLogs_createdAt_idx` ON `importLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `locations_countryId_idx` ON `locations` (`countryId`);--> statement-breakpoint
CREATE INDEX `locations_slug_idx` ON `locations` (`slug`);--> statement-breakpoint
CREATE INDEX `seoMetadata_contentType_contentId_idx` ON `seoMetadata` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `sitemapEntries_url_idx` ON `sitemapEntries` (`url`);--> statement-breakpoint
CREATE INDEX `tourLocations_tourId_idx` ON `tourLocations` (`tourId`);--> statement-breakpoint
CREATE INDEX `tourLocations_locationId_idx` ON `tourLocations` (`locationId`);--> statement-breakpoint
CREATE INDEX `tours_slug_idx` ON `tours` (`slug`);--> statement-breakpoint
CREATE INDEX `tours_category_idx` ON `tours` (`category`);