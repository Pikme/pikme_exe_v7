CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`userId` int,
	`guestName` varchar(255) NOT NULL,
	`guestEmail` varchar(255) NOT NULL,
	`guestPhone` varchar(20),
	`numberOfGuests` int NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date,
	`totalPrice` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'INR',
	`specialRequests` text,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`stripePaymentId` varchar(255),
	`stripeCustomerId` varchar(255),
	`paymentStatus` enum('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
	`refundAmount` decimal(10,2),
	`refundReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`userId` int,
	`guestName` varchar(255) NOT NULL,
	`guestEmail` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`text` text,
	`verified` boolean NOT NULL DEFAULT false,
	`helpful` int NOT NULL DEFAULT 0,
	`unhelpful` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bookings_tourId_idx` ON `bookings` (`tourId`);--> statement-breakpoint
CREATE INDEX `bookings_userId_idx` ON `bookings` (`userId`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `bookings_paymentStatus_idx` ON `bookings` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `bookings_guestEmail_idx` ON `bookings` (`guestEmail`);--> statement-breakpoint
CREATE INDEX `bookings_startDate_idx` ON `bookings` (`startDate`);--> statement-breakpoint
CREATE INDEX `bookings_createdAt_idx` ON `bookings` (`createdAt`);--> statement-breakpoint
CREATE INDEX `bookings_stripePaymentId_idx` ON `bookings` (`stripePaymentId`);--> statement-breakpoint
CREATE INDEX `reviews_tourId_idx` ON `reviews` (`tourId`);--> statement-breakpoint
CREATE INDEX `reviews_userId_idx` ON `reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `reviews_rating_idx` ON `reviews` (`rating`);--> statement-breakpoint
CREATE INDEX `reviews_status_idx` ON `reviews` (`status`);--> statement-breakpoint
CREATE INDEX `reviews_createdAt_idx` ON `reviews` (`createdAt`);