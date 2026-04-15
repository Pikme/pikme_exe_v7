ALTER TABLE `activities` ADD `slug` varchar(200);--> statement-breakpoint
ALTER TABLE `activities` ADD CONSTRAINT `activities_slug_unique` UNIQUE(`slug`);