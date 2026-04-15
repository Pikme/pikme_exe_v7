ALTER TABLE `homePageSettings` ADD `servicesTitle` varchar(255) DEFAULT 'About Pikmeusa.com Services';--> statement-breakpoint
ALTER TABLE `homePageSettings` ADD `servicesSubtitle` varchar(255) DEFAULT 'Our Core Services';--> statement-breakpoint
ALTER TABLE `homePageSettings` ADD `services` json DEFAULT ('[]') NOT NULL;--> statement-breakpoint
ALTER TABLE `homePageSettings` ADD `servicesCarouselImages` json DEFAULT ('[]') NOT NULL;