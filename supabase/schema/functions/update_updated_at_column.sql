-- ============================================================
-- Function: update_updated_at_column
-- Automatically sets updated_at to the current timestamp
-- before any UPDATE on a table.
-- Used by triggers on: tbl_projects, tbl_tasks,
-- tbl_project_briefs, tbl_ai_conversations
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
