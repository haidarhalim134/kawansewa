ALTER TABLE "items" ADD COLUMN "deposit_amount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "rentals" ADD COLUMN "deposit_held" numeric(10, 2) DEFAULT '0' NOT NULL;