ALTER TYPE "public"."rental_status" ADD VALUE 'paid';--> statement-breakpoint
CREATE TABLE "voucher_used" (
	"voucher_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voucher_used_voucher_id_user_id_pk" PRIMARY KEY("voucher_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "vouchers" ADD COLUMN "max_usage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vouchers" ADD COLUMN "start_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "vouchers" ADD COLUMN "end_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "vouchers" ADD COLUMN "is_active" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "voucher_used" ADD CONSTRAINT "voucher_used_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_used" ADD CONSTRAINT "voucher_used_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;