CREATE TABLE `homePageSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sliderImages` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homePageSettings_id` PRIMARY KEY(`id`)
);
