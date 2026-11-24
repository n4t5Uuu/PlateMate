CREATE ROLE "platemate_app";--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_live_unique" ON "users" USING btree ("email") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE POLICY "users_select" ON "users" AS PERMISSIVE FOR SELECT TO "platemate_app" USING (clerk_user_id = current_setting('app.clerk_user_id', true) or current_setting('app.actor', true) = 'clerk-sync');--> statement-breakpoint
CREATE POLICY "users_insert" ON "users" AS PERMISSIVE FOR INSERT TO "platemate_app" WITH CHECK (clerk_user_id = current_setting('app.clerk_user_id', true) or current_setting('app.actor', true) = 'clerk-sync');--> statement-breakpoint
CREATE POLICY "users_update" ON "users" AS PERMISSIVE FOR UPDATE TO "platemate_app" USING (current_setting('app.actor', true) = 'clerk-sync') WITH CHECK (current_setting('app.actor', true) = 'clerk-sync');