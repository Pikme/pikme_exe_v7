ALTER TABLE `webhookEndpoints` ADD `isPaused` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `webhookEndpoints_isPaused_idx` ON `webhookEndpoints` (`isPaused`);