ALTER TABLE "bug_report" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "lead_id" integer;
