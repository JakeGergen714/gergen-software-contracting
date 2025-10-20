CREATE TYPE discovery_stage AS ENUM ('INTAKE','SCOPING','PROPOSAL','SIGNED');

CREATE TABLE discovery_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage discovery_stage NOT NULL DEFAULT 'INTAKE',
  scheduled_at TIMESTAMPTZ NULL,
  duration_minutes INT NULL,
  agenda_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discovery_project_scheduled ON discovery_sessions(project_id, scheduled_at DESC);
