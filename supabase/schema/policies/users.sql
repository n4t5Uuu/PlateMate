-- ============================================================
-- RLS Policies: tbl_users
-- Users can only read, insert, and update their own row.
-- No user can view or modify another user's data.
-- ============================================================

ALTER TABLE tbl_users ENABLE ROW LEVEL SECURITY;

-- Allow a user to read only their own row
DROP POLICY IF EXISTS "users: read own row" ON tbl_users;
CREATE POLICY "users: read own row"
  ON tbl_users FOR SELECT
  USING (id = auth.uid());

-- Allow a user to update only their own row
DROP POLICY IF EXISTS "users: update own row" ON tbl_users;
CREATE POLICY "users: update own row"
  ON tbl_users FOR UPDATE
  USING (id = auth.uid());

-- Allow a user to insert only their own row (id must match the logged-in user)
DROP POLICY IF EXISTS "users: insert own row" ON tbl_users;
CREATE POLICY "users: insert own row"
  ON tbl_users FOR INSERT
  WITH CHECK (id = auth.uid());
