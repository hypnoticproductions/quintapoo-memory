CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_id` varchar(128) NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text NOT NULL,
	`attachment_url` varchar(1024),
	`sent_to_base44` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_task_id_unique` UNIQUE(`task_id`)
);
--> statement-breakpoint
CREATE TABLE `processed_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`external_content_id` varchar(128) NOT NULL,
	`tension` varchar(256),
	`mood` varchar(128),
	`angle` varchar(128),
	`song_id` varchar(128),
	`song_title` varchar(512),
	`song_artist` varchar(256),
	`song_spotify_url` varchar(1024),
	`song_genre` varchar(128),
	`song_themes` text,
	`article_title` varchar(512) NOT NULL,
	`article_body` text NOT NULL,
	`received_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processed_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `processed_content_external_content_id_unique` UNIQUE(`external_content_id`)
);
