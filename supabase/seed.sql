-- ============================================================
-- Supabase Local Seed Data
-- Wipes and repopulates the local database with initial mock data
-- ============================================================

-- Enable pgcrypto extension for password hashing if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert Authentication Users (auth.users)
-- This will trigger handle_new_auth_user() and create_workspace_for_new_user()

-- User 1: Alden Olmedo (Main User / Lead Architect)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'authenticated',
  'authenticated',
  'olmedoalden4@gmail.com', -- Login Email
  crypt('123456', gen_salt('bf')), -- Login Password: '123456'
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Alden", "lastName": "Olmedo"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- User 2: Jane Smith (Collaborator / Associate Architect)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c',
  'authenticated',
  'authenticated',
  'jane.smith@example.com',
  crypt('123456', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Jane", "lastName": "Smith"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- User 3: Mark Johnson (Structural Engineer Partner)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'e2d1c0b9-a8f7-6e5d-4c3b-2a1f0e9d8c7b',
  'authenticated',
  'authenticated',
  'mark.johnson@example.com',
  crypt('123456', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Mark", "lastName": "Johnson"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;


-- 1.5. Insert matching identities into auth.identities
-- Supabase Auth requires an identity row to map the login email to the user record
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  '{"sub":"a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d","email":"olmedoalden4@gmail.com"}'::jsonb,
  'email',
  now(),
  now(),
  now()
),
(
  'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c',
  'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c',
  'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c',
  '{"sub":"f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c","email":"jane.smith@example.com"}'::jsonb,
  'email',
  now(),
  now(),
  now()
),
(
  'e2d1c0b9-a8f7-6e5d-4c3b-2a1f0e9d8c7b',
  'e2d1c0b9-a8f7-6e5d-4c3b-2a1f0e9d8c7b',
  'e2d1c0b9-a8f7-6e5d-4c3b-2a1f0e9d8c7b',
  '{"sub":"e2d1c0b9-a8f7-6e5d-4c3b-2a1f0e9d8c7b","email":"mark.johnson@example.com"}'::jsonb,
  'email',
  now(),
  now(),
  now()
);


-- 2. Insert Mock Projects under Alden Olmedo's Workspace
-- We retrieve Alden's automatically created workspace via SQL subquery
DO $$
DECLARE
    alden_user_id UUID := 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    jane_user_id UUID := 'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c';
    mark_user_id UUID := 'e2d1c0b9-a8f7-6e5d-4c3b-2a1f0e9d8c7b';
    alden_workspace_id UUID;
    
    proj1_id UUID := '11111111-1111-1111-1111-111111111111';
    proj2_id UUID := '22222222-2222-2222-2222-222222222222';
    proj3_id UUID := '33333333-3333-3333-3333-333333333333';
    proj4_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN
    -- Get Alden's personal workspace ID (automatically created by the signup trigger)
    SELECT workspace_id INTO alden_workspace_id
    FROM public.tbl_workspace_members
    WHERE user_id = alden_user_id AND role = 'owner'
    LIMIT 1;

    IF alden_workspace_id IS NOT NULL THEN
        -- Insert Project 1: Modern Villa Concept (Active, High Priority)
        INSERT INTO public.tbl_projects (id, workspace_id, owner_id, name, description, client_name, priority, status, due_date, progress)
        VALUES (
            proj1_id,
            alden_workspace_id,
            alden_user_id,
            'Modern Villa Concept',
            'A sustainable 3-story residential villa project featuring local timber framing, solar panels, and green roofs.',
            'Mr. & Mrs. Henderson',
            'high',
            'active',
            CURRENT_DATE + INTERVAL '45 days',
            35.0
        )
        ON CONFLICT (id) DO NOTHING;

        -- Insert Project 2: Coastal Breeze Cafe (Active, Medium Priority)
        INSERT INTO public.tbl_projects (id, workspace_id, owner_id, name, description, client_name, priority, status, due_date, progress)
        VALUES (
            proj2_id,
            alden_workspace_id,
            alden_user_id,
            'Coastal Breeze Cafe',
            'Renovation design for a beachside cafe including outdoor deck spaces, custom bar layout, and acoustic treatments.',
            'Breeze Cafe Group LLC',
            'medium',
            'active',
            CURRENT_DATE + INTERVAL '90 days',
            12.5
        )
        ON CONFLICT (id) DO NOTHING;

        -- Insert Project 3: Urban Library Pavilion (Completed, Low Priority)
        INSERT INTO public.tbl_projects (id, workspace_id, owner_id, name, description, client_name, priority, status, due_date, progress)
        VALUES (
            proj3_id,
            alden_workspace_id,
            alden_user_id,
            'Urban Library Pavilion',
            'Small-scale community library extension featuring timber lattices and high natural lighting setups.',
            'City Cultural Board',
            'low',
            'completed',
            CURRENT_DATE - INTERVAL '10 days',
            100.0
        )
        ON CONFLICT (id) DO NOTHING;

        -- Insert Project 4: High-Rise Office Atrium (Active, Medium Priority)
        INSERT INTO public.tbl_projects (id, workspace_id, owner_id, name, description, client_name, priority, status, due_date, progress)
        VALUES (
            proj4_id,
            alden_workspace_id,
            alden_user_id,
            'High-Rise Office Atrium',
            'Lobby and multi-level atrium redesign for the downtown commercial tower focusing on biophilic design.',
            'Summit Properties Inc.',
            'medium',
            'active',
            CURRENT_DATE + INTERVAL '120 days',
            5.0
        )
        ON CONFLICT (id) DO NOTHING;

        -- Add Jane Smith as a collaborator to the Modern Villa & Coastal Breeze Cafe
        INSERT INTO public.tbl_project_members (project_id, user_id, role)
        VALUES 
            (proj1_id, jane_user_id, 'member'),
            (proj2_id, jane_user_id, 'member')
        ON CONFLICT (project_id, user_id) DO NOTHING;

        -- Add Mark Johnson (Structural Engineer) to the High-Rise Office Atrium & Modern Villa
        INSERT INTO public.tbl_project_members (project_id, user_id, role)
        VALUES 
            (proj1_id, mark_user_id, 'member'),
            (proj4_id, mark_user_id, 'member')
        ON CONFLICT (project_id, user_id) DO NOTHING;
    END IF;
END $$;
