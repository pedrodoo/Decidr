CREATE TABLE "bug_report" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"description" text NOT NULL,
	"where_found" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
