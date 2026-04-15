CREATE TABLE `bookingEnquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`country` varchar(100),
	`numberOfTravelers` int NOT NULL,
	`preferredStartDate` varchar(50),
	`preferredEndDate` varchar(50),
	`specialRequests` text,
	`status` enum('new','contacted','booked','rejected') NOT NULL DEFAULT 'new',
	`notes` text,
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`contactedAt` timestamp,
	CONSTRAINT `bookingEnquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bookingEnquiries_tourId_idx` ON `bookingEnquiries` (`tourId`);--> statement-breakpoint
CREATE INDEX `bookingEnquiries_email_idx` ON `bookingEnquiries` (`email`);--> statement-breakpoint
CREATE INDEX `bookingEnquiries_status_idx` ON `bookingEnquiries` (`status`);--> statement-breakpoint
CREATE INDEX `bookingEnquiries_createdAt_idx` ON `bookingEnquiries` (`createdAt`);