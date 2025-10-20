-- Seed demo project and data
INSERT INTO projects (id, title, stage, next_milestone_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo Project', 'IN_DEV', now() + interval '10 days');

-- Note: Replace user ids with actual Keycloak subject IDs in real setup
INSERT INTO project_members (project_id, user_id, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'ADMIN'),
  ('11111111-1111-1111-1111-111111111111', 'lead@example.com', 'LEAD_DEV'),
  ('11111111-1111-1111-1111-111111111111', 'client@example.com', 'CLIENT');

INSERT INTO backlog_items (id, project_id, title, description, acceptance_criteria, status, priority)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'User signup', 'Signup with email + password', '["Form validates email","Sends confirmation email"]', 'IN_DEV', 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Profile page', 'View and edit profile', '["Shows name and email","Save updates"]', 'BETA', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'Export CSV', 'Export table as CSV', '["Click Export","Downloads CSV file"]', 'PLANNED', 5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111', 'Dashboard charts', 'Show KPIs', '["Loads under 2s","Responsive layout"]', 'DONE', 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111', 'Notifications', 'Email reminders', '["Daily summary","Toggle settings"]', 'IN_DEV', 4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111', 'Team roles', 'Assign roles', '["Add member","Set role"]', 'PLANNED', 6);

INSERT INTO approval_packages (id, project_id, name, state, release_notes, env_links, sent_at)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'Week 42 — Beta 1', 'SENT', 'Signup + Profile updates', '["https://staging.example.com"]', now());

INSERT INTO approval_package_items (package_id, backlog_item_id, test_steps, deep_link)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '1) Go to /signup\n2) Create account', 'https://staging.example.com/signup'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '1) Open profile\n2) Change name', 'https://staging.example.com/profile');

INSERT INTO activity (project_id, actor_user_id, action, details)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'lead@example.com', 'CREATE_PACKAGE', '{"name":"Week 42 — Beta 1"}');
