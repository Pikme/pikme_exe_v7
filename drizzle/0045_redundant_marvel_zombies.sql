ALTER TABLE `activities` MODIFY COLUMN `currency` varchar(3) DEFAULT 'INR';--> statement-breakpoint
ALTER TABLE `flights` MODIFY COLUMN `currency` varchar(3) DEFAULT 'INR';--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `currency` varchar(3) DEFAULT 'INR';