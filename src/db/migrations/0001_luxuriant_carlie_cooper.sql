CREATE TABLE "exchange_rate_snapshots" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"base" text DEFAULT 'USD' NOT NULL,
	"rates" jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
