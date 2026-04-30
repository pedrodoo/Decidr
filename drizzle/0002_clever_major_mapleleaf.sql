CREATE TABLE "invite" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "invite_token_hash_unique" UNIQUE("token_hash")
);
