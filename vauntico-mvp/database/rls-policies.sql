-- =============================================
-- VAUNTICO TRUST SCORE PLATFORM
-- ROW LEVEL SECURITY POLICIES
-- =============================================
-- Critical security layer ensuring users only see their own data
-- Run in Supabase SQL Editor after migrations are complete

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
-- Note: Service role automatically bypasses RLS policies

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats_cache ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Users can insert their own profile (during signup via AuthProvider)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- No delete policy for users table - administrators only via service role

-- =============================================
-- OAUTH CONNECTIONS POLICIES
-- =============================================

-- Users can view their own OAuth connections
DROP POLICY IF EXISTS "Users can view own oauth_connections" ON public.oauth_connections;
CREATE POLICY "Users can view own oauth_connections" ON public.oauth_connections
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own OAuth connections
DROP POLICY IF EXISTS "Users can insert own oauth_connections" ON public.oauth_connections;
CREATE POLICY "Users can insert own oauth_connections" ON public.oauth_connections
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own OAuth connections
DROP POLICY IF EXISTS "Users can update own oauth_connections" ON public.oauth_connections;
CREATE POLICY "Users can update own oauth_connections" ON public.oauth_connections
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own OAuth connections
DROP POLICY IF EXISTS "Users can delete own oauth_connections" ON public.oauth_connections;
CREATE POLICY "Users can delete own oauth_connections" ON public.oauth_connections
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- CONTENT ITEMS POLICIES
-- =============================================

-- Users can view their own content items
DROP POLICY IF EXISTS "Users can view own content_items" ON public.content_items;
CREATE POLICY "Users can view own content_items" ON public.content_items
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own content items
DROP POLICY IF EXISTS "Users can insert own content_items" ON public.content_items;
CREATE POLICY "Users can insert own content_items" ON public.content_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own content items
DROP POLICY IF EXISTS "Users can update own content_items" ON public.content_items;
CREATE POLICY "Users can update own content_items" ON public.content_items
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own content items
DROP POLICY IF EXISTS "Users can delete own content_items" ON public.content_items;
CREATE POLICY "Users can delete own content_items" ON public.content_items
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- CONTENT METRICS POLICIES
-- =============================================

-- Users can view their own content metrics
DROP POLICY IF EXISTS "Users can view own content_metrics" ON public.content_metrics;
CREATE POLICY "Users can view own content_metrics" ON public.content_metrics
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own content metrics
DROP POLICY IF EXISTS "Users can insert own content_metrics" ON public.content_metrics;
CREATE POLICY "Users can insert own content_metrics" ON public.content_metrics
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own content metrics
DROP POLICY IF EXISTS "Users can update own content_metrics" ON public.content_metrics;
CREATE POLICY "Users can update own content_metrics" ON public.content_metrics
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own content metrics
DROP POLICY IF EXISTS "Users can delete own content_metrics" ON public.content_metrics;
CREATE POLICY "Users can delete own content_metrics" ON public.content_metrics
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- TRUST SCORES POLICIES
-- =============================================

-- Users can view their own trust scores
DROP POLICY IF EXISTS "Users can view own trust_scores" ON public.trust_scores;
CREATE POLICY "Users can view own trust_scores" ON public.trust_scores
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own trust scores
DROP POLICY IF EXISTS "Users can insert own trust_scores" ON public.trust_scores;
CREATE POLICY "Users can insert own trust_scores" ON public.trust_scores
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own trust scores
DROP POLICY IF EXISTS "Users can update own trust_scores" ON public.trust_scores;
CREATE POLICY "Users can update own trust_scores" ON public.trust_scores
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own trust scores
DROP POLICY IF EXISTS "Users can delete own trust_scores" ON public.trust_scores;
CREATE POLICY "Users can delete own trust_scores" ON public.trust_scores
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- ANOMALY FLAGS POLICIES
-- =============================================

-- Users can view their own anomaly flags
DROP POLICY IF EXISTS "Users can view own anomaly_flags" ON public.anomaly_flags;
CREATE POLICY "Users can view own anomaly_flags" ON public.anomaly_flags
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own anomaly flags
DROP POLICY IF EXISTS "Users can insert own anomaly_flags" ON public.anomaly_flags;
CREATE POLICY "Users can insert own anomaly_flags" ON public.anomaly_flags
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own anomaly flags
DROP POLICY IF EXISTS "Users can update own anomaly_flags" ON public.anomaly_flags;
CREATE POLICY "Users can update own anomaly_flags" ON public.anomaly_flags
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own anomaly flags
DROP POLICY IF EXISTS "Users can delete own anomaly_flags" ON public.anomaly_flags;
CREATE POLICY "Users can delete own anomaly_flags" ON public.anomaly_flags
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- USER STATS CACHE POLICIES
-- =============================================

-- Users can view their own stats cache
DROP POLICY IF EXISTS "Users can view own user_stats_cache" ON public.user_stats_cache;
CREATE POLICY "Users can view own user_stats_cache" ON public.user_stats_cache
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own stats cache
DROP POLICY IF EXISTS "Users can insert own user_stats_cache" ON public.user_stats_cache;
CREATE POLICY "Users can insert own user_stats_cache" ON public.user_stats_cache
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own stats cache
DROP POLICY IF EXISTS "Users can update own user_stats_cache" ON public.user_stats_cache;
CREATE POLICY "Users can update own user_stats_cache" ON public.user_stats_cache
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own stats cache
DROP POLICY IF EXISTS "Users can delete own user_stats_cache" ON public.user_stats_cache;
CREATE POLICY "Users can delete own user_stats_cache" ON public.user_stats_cache
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Use these to verify policies are working:

-- 1. Check RLS is enabled on tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 2. List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- 3. Test user access (replace USER_AUTH_UID with actual user ID):
-- SELECT * FROM users WHERE id = 'USER_AUTH_UID'; -- Should work
-- SELECT * FROM users LIMIT 1; -- Should return empty if not user's own record
