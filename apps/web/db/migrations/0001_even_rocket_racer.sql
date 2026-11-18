CREATE TYPE "public"."review_status" AS ENUM('published', 'pending', 'hidden');--> statement-breakpoint
CREATE TABLE "reviews" (
	"review_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"reviewer_name" varchar(80) NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(160) NOT NULL,
	"body" text NOT NULL,
	"first_hand_experience" integer DEFAULT 1 NOT NULL,
	"public_display_mode" varchar(20) DEFAULT 'profile_name' NOT NULL,
	"experience_date" timestamp with time zone,
	"status" "review_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_entity_id_entities_entity_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("entity_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reviews_entity_created_idx" ON "reviews" USING btree ("entity_id","created_at");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");