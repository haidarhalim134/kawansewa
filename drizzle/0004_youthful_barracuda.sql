CREATE TYPE "public"."item_status" AS ENUM('available', 'unavailable', 'pending_rent');--> statement-breakpoint
CREATE TYPE "public"."rental_status" AS ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'canceled');--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "status" "item_status" DEFAULT 'available' NOT NULL;--> statement-breakpoint
ALTER TABLE "rentals" ADD COLUMN "status" "rental_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "identification_image_url" varchar(1024);