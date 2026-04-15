CREATE TABLE `auditLogReencryptionJob` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`status` enum('pending','in_progress','completed','failed','paused') NOT NULL DEFAULT 'pending',
	`oldKeyId` varchar(64) NOT NULL,
	`newKeyId` varchar(64) NOT NULL,
	`totalRecords` int NOT NULL DEFAULT 0,
	`processedRecords` int NOT NULL DEFAULT 0,
	`failedRecords` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastRetryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auditLogReencryptionJob_id` PRIMARY KEY(`id`),
	CONSTRAINT `auditLogReencryptionJob_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
CREATE TABLE `encryptedAuditLogStorage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auditLogId` int NOT NULL,
	`keyId` varchar(64) NOT NULL,
	`encryptedData` text NOT NULL,
	`iv` varchar(32) NOT NULL,
	`authTag` varchar(32) NOT NULL,
	`salt` varchar(64) NOT NULL,
	`algorithm` varchar(32) NOT NULL DEFAULT 'aes-256-gcm',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `encryptedAuditLogStorage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `encryptionKeyRotation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyId` varchar(64) NOT NULL,
	`status` enum('active','rotating','retired','archived') NOT NULL DEFAULT 'active',
	`algorithm` varchar(32) NOT NULL DEFAULT 'aes-256-gcm',
	`keyHash` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`activatedAt` timestamp,
	`retiredAt` timestamp,
	`archivedAt` timestamp,
	`metadata` json,
	`createdBy` int,
	CONSTRAINT `encryptionKeyRotation_id` PRIMARY KEY(`id`),
	CONSTRAINT `encryptionKeyRotation_keyId_unique` UNIQUE(`keyId`)
);
--> statement-breakpoint
CREATE TABLE `keyRotationEventLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('key_generated','key_activated','key_retired','key_archived','rotation_started','rotation_completed','rotation_failed','manual_rotation_initiated') NOT NULL,
	`keyId` varchar(64),
	`jobId` varchar(64),
	`userId` int,
	`userName` varchar(255),
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keyRotationEventLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `auditLogReencryptionJob_status_idx` ON `auditLogReencryptionJob` (`status`);--> statement-breakpoint
CREATE INDEX `auditLogReencryptionJob_oldKeyId_idx` ON `auditLogReencryptionJob` (`oldKeyId`);--> statement-breakpoint
CREATE INDEX `auditLogReencryptionJob_newKeyId_idx` ON `auditLogReencryptionJob` (`newKeyId`);--> statement-breakpoint
CREATE INDEX `auditLogReencryptionJob_createdAt_idx` ON `auditLogReencryptionJob` (`createdAt`);--> statement-breakpoint
CREATE INDEX `encryptedAuditLogStorage_auditLogId_idx` ON `encryptedAuditLogStorage` (`auditLogId`);--> statement-breakpoint
CREATE INDEX `encryptedAuditLogStorage_keyId_idx` ON `encryptedAuditLogStorage` (`keyId`);--> statement-breakpoint
CREATE INDEX `encryptedAuditLogStorage_createdAt_idx` ON `encryptedAuditLogStorage` (`createdAt`);--> statement-breakpoint
CREATE INDEX `encryptionKeyRotation_status_idx` ON `encryptionKeyRotation` (`status`);--> statement-breakpoint
CREATE INDEX `encryptionKeyRotation_createdAt_idx` ON `encryptionKeyRotation` (`createdAt`);--> statement-breakpoint
CREATE INDEX `keyRotationEventLog_eventType_idx` ON `keyRotationEventLog` (`eventType`);--> statement-breakpoint
CREATE INDEX `keyRotationEventLog_keyId_idx` ON `keyRotationEventLog` (`keyId`);--> statement-breakpoint
CREATE INDEX `keyRotationEventLog_jobId_idx` ON `keyRotationEventLog` (`jobId`);--> statement-breakpoint
CREATE INDEX `keyRotationEventLog_createdAt_idx` ON `keyRotationEventLog` (`createdAt`);