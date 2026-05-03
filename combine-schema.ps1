$schema = "src/lib/supabase/schema"

$files = @(
    # plpgsql functions — not validated at creation, safe to run before tables
    "$schema/functions/update_updated_at_column.sql",
    "$schema/functions/handle_new_auth_user.sql",
    "$schema/functions/create_workspace_for_new_user.sql",
    # Tables must exist before sql-language functions that reference them
    "$schema/create_tables.sql",
    "$schema/indexes.sql",
    # sql-language functions — validated at creation, need tables to exist first
    "$schema/functions/is_workspace_member.sql",
    "$schema/functions/is_workspace_owner.sql",
    "$schema/triggers.sql",
    "$schema/policies/users.sql",
    "$schema/policies/workspaces.sql",
    "$schema/policies/workspace_members.sql",
    "$schema/policies/projects.sql",
    "$schema/policies/project_members.sql",
    "$schema/policies/pinned_projects.sql",
    "$schema/policies/tasks.sql",
    "$schema/policies/subtasks.sql",
    "$schema/policies/activity_logs.sql",
    "$schema/policies/versions.sql",
    "$schema/policies/version_annotations.sql",
    "$schema/policies/version_revision_notes.sql",
    "$schema/policies/moodboard_items.sql",
    "$schema/policies/project_briefs.sql",
    "$schema/policies/submission_checklists.sql",
    "$schema/policies/checklist_items.sql",
    "$schema/policies/crit_sessions.sql",
    "$schema/policies/crit_notes.sql",
    "$schema/policies/ai_conversations.sql"
)

$combined = ($files | ForEach-Object { Get-Content $_ -Raw }) -join "`n`n"
$combined | Set-Clipboard

Write-Host "Done. Paste into the Supabase SQL editor."
