ALTER TABLE `destinationGalleryCards` ADD `categoryId` int NOT NULL;--> statement-breakpoint
CREATE INDEX `destinationGalleryCards_categoryId_idx` ON `destinationGalleryCards` (`categoryId`);