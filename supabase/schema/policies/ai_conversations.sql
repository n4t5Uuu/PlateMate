-- ============================================================
-- RLS Policies: tbl_ai_conversations
-- Users can only access their own AI conversations.
-- No one else can view, edit, or delete another user's conversations.
-- ============================================================

ALTER TABLE tbl_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own conversations
DROP POLICY IF EXISTS "ai_conversations: view own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: view own"
  ON tbl_ai_conversations FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to create conversations only for themselves
DROP POLICY IF EXISTS "ai_conversations: insert own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: insert own"
  ON tbl_ai_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own conversations
DROP POLICY IF EXISTS "ai_conversations: update own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: update own"
  ON tbl_ai_conversations FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to delete only their own conversations
DROP POLICY IF EXISTS "ai_conversations: delete own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: delete own"
  ON tbl_ai_conversations FOR DELETE
  USING (user_id = auth.uid());
