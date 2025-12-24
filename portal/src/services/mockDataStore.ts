import {
  Business,
  BusinessOverview,
  CreateEpicInput,
  CreateProjectInput,
  CreateSprintInput,
  CreateStoryInput,
  Epic,
  EpicStatus,
  Meeting,
  ProjectDetail,
  ProjectStage,
  ProjectSummary,
  Story,
  StoryStage,
  UpdateStoryInput,
  User,
} from '../types/domain';
import { createId } from '../utils/id';

interface UserRecord extends User {
  password: string;
  businessId: string;
}

const SEEDED_IDS = {
  business: 'biz_acme_freight',
  user: 'user_taylor_reeves',
  project: 'proj_client_portal',
  invoiceEpic: 'epic_invoice_workspace',
  dashboardEpic: 'epic_operations_dashboard',
  sprintIntake: 'sprint_intake_foundations',
  sprintDashboard: 'sprint_dashboard_first_look',
} as const;

class MockDataStore {
  private users = new Map<string, UserRecord>();
  private businesses = new Map<string, Business>();
  private projects = new Map<string, ProjectDetail>();

  constructor() {
    this.seed();
  }

  private seed() {
    if (this.users.size > 0) return;
    const businessId = SEEDED_IDS.business;
    const userId = SEEDED_IDS.user;
    const now = new Date().toISOString();
    const business: Business = {
      id: businessId,
      name: 'Acme Freight Logistics',
      primaryContactUserId: userId,
      createdAt: now,
    };

    const defaultProjectId = SEEDED_IDS.project;
    const invoiceEpicId = SEEDED_IDS.invoiceEpic;
    const dashboardEpicId = SEEDED_IDS.dashboardEpic;
    const sprintOneId = SEEDED_IDS.sprintIntake;
    const sprintTwoId = SEEDED_IDS.sprintDashboard;

    const meetings: Meeting[] = [
      {
        id: createId('meet'),
        projectId: defaultProjectId,
        stage: 'REQUIREMENTS',
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'DISCOVERY',
        locationUrl: 'https://meet.example.com/requirements',
        summary: 'Logistics intake call: workflows + integrations',
      },
      {
        id: createId('meet'),
        projectId: defaultProjectId,
        stage: 'REQUIREMENTS',
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'REVIEW',
        locationUrl: 'https://meet.example.com/kickoff-notes',
        summary: 'Kickoff recap',
        notes:
          'Discussed shipment lifecycle, existing TMS, and invoice approvals. Identified need for bi-directional sync with QuickBooks.',
      },
    ];

    const epics: Epic[] = [
      {
        id: invoiceEpicId,
        projectId: defaultProjectId,
        name: 'Invoice Workspace',
        description: 'Create, approve, and sync invoices without leaving the portal.',
        color: '#0ea5e9',
        status: 'PLANNED',
        acceptanceCriteria: [
          'Ops can create draft invoices tied to shipments.',
          'Finance can approve + sync drafts to QuickBooks.',
          'Clients can download branded PDFs.',
        ],
      },
      {
        id: dashboardEpicId,
        projectId: defaultProjectId,
        name: 'Operations Dashboard',
        description: 'Surface live shipment health and automation alerts.',
        color: '#f97316',
        status: 'IN_PROGRESS',
        acceptanceCriteria: [
          'Single dashboard shows ETA risk, holds, escalations.',
          'Auto-notify ops when shipments miss SLA.',
          'Share filtered view with clients.',
        ],
      },
    ];

    const stories: Story[] = [
      {
        id: createId('story'),
        epicId: dashboardEpicId,
        projectId: defaultProjectId,
        title: 'Show live shipment health widgets',
        description:
          'Initial widget framework pulling data from the telemetry feed with placeholder visuals.',
        acceptanceCriteria: [
          'Display at least three widgets (ETA risk, holds, escalations).',
          'Pull data every 5 minutes from TMS feed.',
        ],
        stage: 'IN_PROGRESS',
        sprintId: sprintTwoId,
        points: 5,
      },
      {
        id: createId('story'),
        epicId: invoiceEpicId,
        projectId: defaultProjectId,
        title: 'Finance approval screen',
        description: 'Internal approval experience for finance to act on draft invoices.',
        acceptanceCriteria: [
          'Finance can view drafts, approve, reject.',
          'Audit trail stored on approval.',
        ],
        stage: 'BACKLOG',
        points: 3,
      },
    ];

    const project: ProjectDetail = {
      id: defaultProjectId,
      businessId,
      name: 'Client Portal Modernization',
      description:
        'Replace the legacy portal with a single workflow for shippers and ops teams.',
      stage: 'PLANNING',
      approvalState: 'DRAFT',
      kickoffCallAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now,
      statusNote: 'Epics drafted, backlog grooming underway.',
      epics,
      stories,
      sprints: [
        {
          id: sprintOneId,
          projectId: defaultProjectId,
          name: 'Sprint 1 • Intake Foundations',
          startAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          endAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          goal: 'Capture shipper inputs + unify account record.',
          status: 'COMPLETE',
          notes: 'Delivered admin intake and shipper self-serve forms.',
        },
        {
          id: sprintTwoId,
          projectId: defaultProjectId,
          name: 'Sprint 2 • Dashboard First Look',
          startAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          goal: 'Ship first dashboard widgets + webhook plumbing.',
          status: 'ACTIVE',
        },
      ],
      meetings,
    };

    this.businesses.set(businessId, business);
    this.projects.set(defaultProjectId, project);

    this.users.set(userId, {
      id: userId,
      email: 'client@acme-freight.io',
      firstName: 'Taylor',
      lastName: 'Reeves',
      role: 'CLIENT_OWNER',
      password: 'demo1234',
      businessId,
    });
  }

  public createUserAndBusiness(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    businessName: string;
  }): { user: User; business: Business } {
    if (this.findUserByEmail(input.email)) {
      throw new Error('Email already registered');
    }
    const userId = createId('user');
    const businessId = createId('biz');
    const business: Business = {
      id: businessId,
      name: input.businessName,
      primaryContactUserId: userId,
      createdAt: new Date().toISOString(),
    };
    const user: UserRecord = {
      id: userId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'CLIENT_OWNER',
      password: input.password,
      businessId,
    };
    this.businesses.set(businessId, business);
    this.users.set(userId, user);
    return { user, business };
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    return Array.from(this.users.values()).find(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );
  }

  public getBusinessOverview(businessId: string): BusinessOverview {
    const business = this.businesses.get(businessId);
    if (!business) {
      throw new Error('Business not found');
    }
    const projects: ProjectSummary[] = Array.from(this.projects.values())
      .filter((p) => p.businessId === businessId)
      .map((p) => ({
        id: p.id,
        businessId: p.businessId,
        name: p.name,
        description: p.description,
        stage: p.stage,
        approvalState: p.approvalState,
        kickoffCallAt: p.kickoffCallAt,
        updatedAt: p.updatedAt,
        statusNote: p.statusNote,
      }));
    return { business, projects };
  }

  public createProject(
    businessId: string,
    input: CreateProjectInput
  ): ProjectDetail {
    const projectId = createId('proj');
    const project: ProjectDetail = {
      id: projectId,
      businessId,
      name: input.name,
      description: input.description,
      stage: 'REQUIREMENTS',
      approvalState: 'DRAFT',
      kickoffCallAt: input.kickoffCallAt,
      updatedAt: new Date().toISOString(),
      epics: [],
      stories: [],
      sprints: [],
      meetings: [],
    };
    this.projects.set(projectId, project);
    return project;
  }

  public getProjectDetail(projectId: string): ProjectDetail {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  public updateProject(project: ProjectDetail) {
    this.projects.set(project.id, { ...project, updatedAt: new Date().toISOString() });
  }

  public listProjects(businessId: string): ProjectSummary[] {
    return this.getBusinessOverview(businessId).projects;
  }

  public addMeeting(projectId: string, meeting: Meeting) {
    const project = this.getProjectDetail(projectId);
    project.meetings = [...project.meetings, meeting];
    this.updateProject(project);
  }

  public advanceProjectStage(projectId: string, stage: ProjectStage) {
    const project = this.getProjectDetail(projectId);
    project.stage = stage;
    this.updateProject(project);
  }

  public addStory(projectId: string, input: CreateStoryInput) {
    const project = this.getProjectDetail(projectId);
    const story: Story = {
      id: createId('story'),
      epicId: input.epicId,
      projectId,
      title: input.title,
      description: input.description,
      acceptanceCriteria: input.acceptanceCriteria,
      stage: input.stage ?? 'BACKLOG',
      sprintId: input.sprintId || undefined,
      points: input.points,
      planningOrder: input.planningOrder ?? null,
    };
    project.stories = [...project.stories, story];
    this.updateProject(project);
  }

  public deleteStory(projectId: string, storyId: string) {
    const project = this.getProjectDetail(projectId);
    project.stories = project.stories.filter((story) => story.id !== storyId);
    this.updateProject(project);
  }

  public updateStory(projectId: string, storyId: string, input: UpdateStoryInput) {
    const project = this.getProjectDetail(projectId);
    project.stories = project.stories.map((story) =>
      story.id === storyId
        ? {
          ...story,
          epicId: input.epicId,
          title: input.title,
          description: input.description,
          acceptanceCriteria: input.acceptanceCriteria,
          points: input.points,
          sprintId: input.sprintId || undefined,
          stage: input.stage,
          planningOrder:
            input.planningOrder === undefined
              ? story.planningOrder
              : input.planningOrder,
        }
        : story
    );
    this.updateProject(project);
  }

  public addEpic(projectId: string, input: CreateEpicInput) {
    const project = this.getProjectDetail(projectId);
    const epic: Epic = {
      id: createId('epic'),
      projectId,
      name: input.name,
      description: input.description,
      color: input.color || '#0f172a',
      status: 'PLANNED',
      acceptanceCriteria: input.acceptanceCriteria,
      clientSummary: input.clientSummary,
    };
    project.epics = [...project.epics, epic];
    this.updateProject(project);
  }

  public updateEpic(
    projectId: string,
    epicId: string,
    input: Partial<Omit<Epic, 'id' | 'projectId'>>
  ) {
    const project = this.getProjectDetail(projectId);
    project.epics = project.epics.map((epic) =>
      epic.id === epicId ? { ...epic, ...input } : epic
    );
    this.updateProject(project);
  }

  public updateEpicStatus(
    projectId: string,
    epicId: string,
    status: EpicStatus
  ) {
    const project = this.getProjectDetail(projectId);
    project.epics = project.epics.map((epic) =>
      epic.id === epicId ? { ...epic, status } : epic
    );
    this.updateProject(project);
  }

  public deleteEpic(projectId: string, epicId: string) {
    const project = this.getProjectDetail(projectId);
    project.epics = project.epics.filter((epic) => epic.id !== epicId);
    this.updateProject(project);
  }

  public updateStoryStage(
    projectId: string,
    storyId: string,
    stage: StoryStage
  ) {
    const project = this.getProjectDetail(projectId);
    project.stories = project.stories.map((story) =>
      story.id === storyId ? { ...story, stage } : story
    );
    this.updateProject(project);
  }

  public addSprint(projectId: string, input: CreateSprintInput) {
    const project = this.getProjectDetail(projectId);
    const sprint = {
      id: createId('sprint'),
      projectId,
      name: input.name,
      startAt: input.startAt,
      endAt: input.endAt,
      goal: input.goal,
      status: 'PLANNED' as const,
    };
    project.sprints = [...project.sprints, sprint];
    this.updateProject(project);
  }

  public deleteSprint(projectId: string, sprintId: string) {
    const project = this.getProjectDetail(projectId);
    project.sprints = project.sprints.filter((sprint) => sprint.id !== sprintId);
    project.stories = project.stories.map((story) =>
      story.sprintId === sprintId ? { ...story, sprintId: undefined } : story
    );
    this.updateProject(project);
  }

  public startSprint(projectId: string, sprintId: string) {
    const project = this.getProjectDetail(projectId);
    const nowIso = new Date().toISOString();

    project.sprints = project.sprints.map((sprint) => {
      if (sprint.id === sprintId) {
        return {
          ...sprint,
          status: 'ACTIVE' as const,
          startAt: sprint.startAt || nowIso,
        };
      }
      if (sprint.status === 'ACTIVE') {
        return { ...sprint, status: 'COMPLETE' as const };
      }
      return sprint;
    });

    this.updateProject(project);
  }

  public endSprint(
    projectId: string,
    sprintId: string,
    options: { moveUnfinishedToNextSprint: boolean }
  ) {
    const project = this.getProjectDetail(projectId);
    const nowIso = new Date().toISOString();

    const sorted = [...project.sprints].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
    const index = sorted.findIndex((s) => s.id === sprintId);
    const nextSprint =
      index >= 0 && index + 1 < sorted.length ? sorted[index + 1] : undefined;

    project.sprints = project.sprints.map((sprint) =>
      sprint.id === sprintId
        ? {
          ...sprint,
          status: 'COMPLETE' as const,
          endAt: sprint.endAt || nowIso,
        }
        : sprint
    );

    project.stories = project.stories.map((story) => {
      if (story.sprintId !== sprintId || story.stage === 'DONE') {
        return story;
      }
      if (options.moveUnfinishedToNextSprint && nextSprint) {
        return {
          ...story,
          sprintId: nextSprint.id,
          stage: story.stage === 'BACKLOG' ? 'READY' : story.stage,
        };
      }
      return {
        ...story,
        sprintId: undefined,
        stage: 'BACKLOG',
      };
    });

    this.updateProject(project);
  }

  public updateStatusNote(projectId: string, statusNote: string) {
    const project = this.getProjectDetail(projectId);
    project.statusNote = statusNote;
    this.updateProject(project);
  }
}

export const mockDataStore = new MockDataStore();
