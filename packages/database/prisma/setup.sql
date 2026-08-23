-- Convio Database Setup (Supabase / Postgres)
-- Run this after `prisma db push` to apply RLS and server configuration.
-- Apply with: psql $DATABASE_URL -f setup.sql
-- NOTE: no ALTER SYSTEM here — Supabase hosted Postgres blocks it (needs superuser).
-- Tune timeouts/work_mem from Supabase Dashboard -> Database settings instead.

-- ============================================================
-- 1. ROW LEVEL SECURITY (security-rls-* rules)
-- ============================================================

-- Organization: members only see their orgs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'organizations_member_policy'
  ) THEN
    ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY organizations_member_policy ON "Organization"
      FOR ALL
      TO authenticated
      USING (id IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Membership: users see their own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'memberships_user_policy'
  ) THEN
    ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY memberships_user_policy ON "Membership"
      FOR ALL
      TO authenticated
      USING ("userId" = (SELECT auth.uid()));
  END IF;
END $$;

-- Agents: org-scoped via membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'agents_org_policy'
  ) THEN
    ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY agents_org_policy ON "Agent"
      FOR ALL
      TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Deployments: scoped via agent's org
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'deployments_org_policy'
  ) THEN
    ALTER TABLE "Deployment" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY deployments_org_policy ON "Deployment"
      FOR ALL
      TO authenticated
      USING ("agentId" IN (
        SELECT a.id FROM "Agent" a
        JOIN "Membership" m ON m."organizationId" = a."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Conversations: scoped to agent's org via membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'conversations_org_policy'
  ) THEN
    ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY conversations_org_policy ON "Conversation"
      FOR ALL
      TO authenticated
      USING ("agentId" IN (
        SELECT a.id FROM "Agent" a
        JOIN "Membership" m ON m."organizationId" = a."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Messages: scoped via conversation -> agent -> org -> membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'messages_org_policy'
  ) THEN
    ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY messages_org_policy ON "Message"
      FOR ALL
      TO authenticated
      USING ("conversationId" IN (
        SELECT c.id FROM "Conversation" c
        JOIN "Agent" a ON a.id = c."agentId"
        JOIN "Membership" m ON m."organizationId" = a."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- KnowledgeBase: org-scoped
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'knowledgebases_org_policy'
  ) THEN
    ALTER TABLE "KnowledgeBase" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY knowledgebases_org_policy ON "KnowledgeBase"
      FOR ALL
      TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Document: scoped via knowledgebase -> org -> membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'documents_org_policy'
  ) THEN
    ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY documents_org_policy ON "Document"
      FOR ALL
      TO authenticated
      USING ("knowledgeBaseId" IN (
        SELECT kb.id FROM "KnowledgeBase" kb
        JOIN "Membership" m ON m."organizationId" = kb."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Tools: org-scoped
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'tools_org_policy'
  ) THEN
    ALTER TABLE "Tool" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY tools_org_policy ON "Tool"
      FOR ALL
      TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- ============================================================
-- 2. PRIVILEGE MANAGEMENT (security-privileges)
-- ============================================================

-- Revoke public schema access from anonymous roles
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- ============================================================
-- 4. EXTENSIONS
-- ============================================================

-- pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 5. PROFILE SYNC (auth.users -> public.profiles)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar, "emailVerified")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name'
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    ),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, NEW.confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
