-- ============================================================
-- Function: handle_new_auth_user
-- Fires after a new user is created in auth.users.
-- Copies the user's id, email, first_name, and last_name
-- into tbl_users so the rest of the app can reference them.
-- This also triggers on_user_created_create_workspace.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tbl_users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
