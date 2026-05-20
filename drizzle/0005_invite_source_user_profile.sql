ALTER TABLE "invite" ADD COLUMN "lead_id" integer;--> statement-breakpoint
ALTER TABLE "invite" ADD COLUMN "source" text DEFAULT 'direct' NOT NULL;--> statement-breakpoint
CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"origin" text NOT NULL,
	"lead_id" integer,
	"invite_id" integer,
	"generate_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"first_generate_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone
);
