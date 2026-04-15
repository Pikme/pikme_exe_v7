CREATE TABLE `countriesCarousel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryName` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(1024) NOT NULL,
	`destinationLink` varchar(1024) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `countriesCarousel_id` PRIMARY KEY(`id`)
);
