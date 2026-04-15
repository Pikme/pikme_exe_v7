ALTER TABLE `reportDeliveries` MODIFY COLUMN `status` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `reportDeliveries` MODIFY COLUMN `attachmentFormat` varchar(20);--> statement-breakpoint
ALTER TABLE `reportSchedules` MODIFY COLUMN `frequency` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `reportSchedules` MODIFY COLUMN `time` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `reportSchedules` MODIFY COLUMN `timezone` varchar(50) NOT NULL DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE `reportSchedules` MODIFY COLUMN `reportType` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `reportSchedules` MODIFY COLUMN `dateRangeType` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `reportSchedules` MODIFY COLUMN `attachmentFormat` varchar(20) NOT NULL DEFAULT 'csv';