-- Real-time ticket conversation: attachments, read receipts, RLS, realtime, storage

-- Attachments stored as JSONB array of { name, size, type, path }
ALTER TABLE "support_ticket_messages" ADD COLUMN IF NOT EXISTS "attachments" JSONB NOT NULL DEFAULT '[]';

-- Read receipts (one row per ticket per user)
CREATE TABLE IF NOT EXISTS "support_ticket_reads" (
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_reads_pkey" PRIMARY KEY ("ticketId", "userId")
);

DO $$ BEGIN
  ALTER TABLE "support_ticket_reads" ADD CONSTRAINT "support_ticket_reads_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "support_ticket_reads" ADD CONSTRAINT "support_ticket_reads_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "support_ticket_reads_userId_lastReadAt_idx"
  ON "support_ticket_reads"("userId", "lastReadAt" DESC);

-- ============================================================
-- Row Level Security (SELECT only — writes go through the API)
-- ============================================================

ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_ticket_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_ticket_reads" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_select_policy') THEN
    CREATE POLICY support_tickets_select_policy ON "support_tickets"
      FOR SELECT TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = auth.uid()::text
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_ticket_messages_select_policy') THEN
    CREATE POLICY support_ticket_messages_select_policy ON "support_ticket_messages"
      FOR SELECT TO authenticated
      USING ("ticketId" IN (
        SELECT t.id FROM "support_tickets" t
        JOIN "Membership" m ON m."organizationId" = t."organizationId"
        WHERE m."userId" = auth.uid()::text
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_ticket_reads_select_policy') THEN
    CREATE POLICY support_ticket_reads_select_policy ON "support_ticket_reads"
      FOR SELECT TO authenticated
      USING ("ticketId" IN (
        SELECT t.id FROM "support_tickets" t
        JOIN "Membership" m ON m."organizationId" = t."organizationId"
        WHERE m."userId" = auth.uid()::text
      ));
  END IF;
END $$;

-- ============================================================
-- Realtime: broadcast-only via API (no postgres_changes needed)
-- Removed from supabase_realtime publication to prevent
-- P0001 "invalid column for filter id" errors.
-- ============================================================

-- ============================================================
-- Storage: private ticket-attachments bucket, org-scoped folders
-- Path convention: {organizationId}/{ticketId}/{uuid}-{filename}
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('ticket-attachments', 'ticket-attachments', false, 10485760)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ticket_attachments_read_policy') THEN
    CREATE POLICY ticket_attachments_read_policy ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'ticket-attachments'
        AND (storage.foldername(name))[1] IN (
          SELECT "organizationId" FROM "Membership" WHERE "userId" = auth.uid()::text
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ticket_attachments_insert_policy') THEN
    CREATE POLICY ticket_attachments_insert_policy ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'ticket-attachments'
        AND (storage.foldername(name))[1] IN (
          SELECT "organizationId" FROM "Membership" WHERE "userId" = auth.uid()::text
        )
      );
  END IF;
END $$;
