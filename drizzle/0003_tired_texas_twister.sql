ALTER TABLE `tours` ADD `morningTime` varchar(20);--> statement-breakpoint
ALTER TABLE `tours` ADD `afternoonTime` varchar(20);--> statement-breakpoint
ALTER TABLE `tours` ADD `amenities` json;--> statement-breakpoint
ALTER TABLE `tours` ADD `accommodation` json;--> statement-breakpoint
ALTER TABLE `tours` ADD `transport` json;--> statement-breakpoint
ALTER TABLE `tours` ADD `pricingTiers` json;--> statement-breakpoint
ALTER TABLE `tours` ADD `cancellationPolicy` text;--> statement-breakpoint
ALTER TABLE `tours` ADD `paymentPolicy` text;--> statement-breakpoint
ALTER TABLE `tours` ADD `importantNotes` text;--> statement-breakpoint
ALTER TABLE `tours` ADD `faqs` json;