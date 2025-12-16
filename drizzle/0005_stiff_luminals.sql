CREATE TYPE "public"."user_status" AS ENUM('unverified', 'pending_verification', 'verified');--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'unverified' NOT NULL;