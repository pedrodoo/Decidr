CREATE TABLE "lead" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'trial' NOT NULL,
	"user_id" text,
	"invite_id" integer,
	"generate_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"converted_at" timestamp with time zone,
	"approval_requested_at" timestamp with time zone,
	"onboarding_completed_at" timestamp with time zone,
	"first_generate_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	CONSTRAINT "lead_email_unique" UNIQUE("email")
);
