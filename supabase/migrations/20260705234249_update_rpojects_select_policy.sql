DROP POLICY IF EXISTS "projects: members can view" ON tbl_projects;
CREATE POLICY "projects: members can view"
    ON tbl_projects FOR SELECT
    USING (owner_id = auth.uid() OR is_project_member(id));

-- Grant schema usage and standard query privileges to Supabase roles
GRANT USAGE ON SCHEMA public to anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;


-- Automatically grant privileges on all future tables/sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;