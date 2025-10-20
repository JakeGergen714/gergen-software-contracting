CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE project_stage AS ENUM ('DRAFT','IN_DEV','BETA','LIVE');
CREATE TYPE backlog_status AS ENUM ('PLANNED','IN_DEV','BETA','DONE');
CREATE TYPE member_role AS ENUM ('ADMIN','LEAD_DEV','CLIENT');
CREATE TYPE pkg_state AS ENUM ('DRAFT','SENT','RESPONDED','RESOLVED');
CREATE TYPE client_status AS ENUM ('UNSET','APPROVED','NEEDS_CHANGES');
CREATE TYPE feedback_source AS ENUM ('PACKAGE_ITEM','BACKLOG_ITEM');
CREATE TYPE feedback_status AS ENUM ('OPEN','RESOLVED');
CREATE TYPE change_request_status AS ENUM ('NONE','PROPOSED','APPROVED');

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  stage project_stage NOT NULL DEFAULT 'DRAFT',
  next_milestone_at TIMESTAMPTZ NULL,
  last_deployment_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role member_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE backlog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  status backlog_status NOT NULL DEFAULT 'PLANNED',
  priority INT NOT NULL DEFAULT 100,
  owner_user_id TEXT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  change_request_status change_request_status NOT NULL DEFAULT 'NONE',
  change_request_reason TEXT NULL,
  links JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE approval_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state pkg_state NOT NULL DEFAULT 'DRAFT',
  release_notes TEXT,
  env_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  test_creds JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ NULL,
  closed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE approval_package_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES approval_packages(id) ON DELETE CASCADE,
  backlog_item_id UUID NOT NULL REFERENCES backlog_items(id) ON DELETE CASCADE,
  client_status client_status NOT NULL DEFAULT 'UNSET',
  client_comment TEXT NULL,
  client_attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  test_steps TEXT NOT NULL,
  deep_link TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_type feedback_source NOT NULL,
  source_id UUID NOT NULL,
  author_user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status feedback_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_backlog_project_status_priority ON backlog_items(project_id, status, priority);
CREATE INDEX idx_packages_project_state ON approval_packages(project_id, state);
CREATE INDEX idx_package_items_package ON approval_package_items(package_id);
CREATE INDEX idx_feedback_project_status ON feedback(project_id, status);
CREATE INDEX idx_activity_project_created_desc ON activity(project_id, created_at DESC);
