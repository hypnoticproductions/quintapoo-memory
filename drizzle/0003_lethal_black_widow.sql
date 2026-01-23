ALTER TABLE `articles` ADD `sally_client_id` varchar(128);--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD `event` varchar(128);--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD `response` text;--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD `status_code` int;--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD `success` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;