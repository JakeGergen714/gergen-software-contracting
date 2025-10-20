-- Minimal tables for client-facing updates and requests

CREATE TABLE project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, -- maintenance | release | note (kept as text for flexibility)
  title TEXT NOT NULL,
  summary TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_updates_project_created_desc ON project_updates(project_id, created_at DESC);

CREATE TABLE client_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- problem | feature | question
  subject TEXT NOT NULL,
  details TEXT NULL,
  status TEXT NOT NULL DEFAULT 'received', -- received | in-progress | done
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_requests_project_created_desc ON client_requests(project_id, created_at DESC);
