CREATE TABLE `call_logs` (
	`id` varchar(128) NOT NULL,
	`client_id` varchar(128),
	`phone_number` varchar(32) NOT NULL,
	`call_duration_seconds` int,
	`call_purpose` enum('status_check','new_task','support','unknown') NOT NULL DEFAULT 'unknown',
	`summary` text NOT NULL,
	`action_required` int NOT NULL DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` varchar(128) NOT NULL,
	`interaction_type` enum('call','brief_submission','email','other') NOT NULL,
	`summary` text NOT NULL,
	`key_points` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(128) NOT NULL,
	`name` varchar(256) NOT NULL,
	`company` varchar(256),
	`phone` varchar(32) NOT NULL,
	`email` varchar(320),
	`payment_status` enum('active','trial','expired') NOT NULL DEFAULT 'trial',
	`trial_end_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manus_task_id` varchar(128) NOT NULL,
	`client_id` varchar(128) NOT NULL,
	`status` enum('pending','active','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`progress_percentage` int NOT NULL DEFAULT 0,
	`current_phase` varchar(256),
	`next_phase` varchar(256),
	`estimated_completion` timestamp,
	`last_activity` timestamp NOT NULL DEFAULT (now()),
	`summary` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `tasks_manus_task_id_unique` UNIQUE(`manus_task_id`)
);
