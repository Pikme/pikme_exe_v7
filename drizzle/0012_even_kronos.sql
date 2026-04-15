ALTER TABLE `tours` ADD `stateId` int;--> statement-breakpoint
CREATE INDEX `tours_stateId_idx` ON `tours` (`stateId`);