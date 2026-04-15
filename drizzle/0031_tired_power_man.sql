ALTER TABLE `tours` ADD `countryId` int;--> statement-breakpoint
CREATE INDEX `tours_countryId_idx` ON `tours` (`countryId`);