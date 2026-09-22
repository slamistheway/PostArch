CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"manual_save" boolean DEFAULT false,
	"parent_id" text NOT NULL,
	"post_id" text NOT NULL,
	"author" text NOT NULL,
	"content" text NOT NULL,
	"url" text NOT NULL,
	"subreddit" text NOT NULL,
	"date_added" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_comments" (
	"list_id" integer NOT NULL,
	"comment_id" text NOT NULL,
	CONSTRAINT "list_comments_list_id_comment_id_pk" PRIMARY KEY("list_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "list_posts" (
	"list_id" integer NOT NULL,
	"post_id" text NOT NULL,
	CONSTRAINT "list_posts_list_id_post_id_pk" PRIMARY KEY("list_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT '',
	"date_added" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pinned" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" text,
	"comment_id" text,
	"date_pinned" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"manual_save" boolean DEFAULT false,
	"author" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"image_path" text,
	"url" text NOT NULL,
	"subreddit" text NOT NULL,
	"date_added" timestamp DEFAULT now() NOT NULL
);
