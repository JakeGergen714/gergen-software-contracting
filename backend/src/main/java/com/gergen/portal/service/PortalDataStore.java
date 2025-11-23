package com.gergen.portal.service;

import com.gergen.portal.api.dto.BusinessDto;
import com.gergen.portal.api.dto.MeetingDto;
import com.gergen.portal.api.dto.ProjectDetailDto;
import com.gergen.portal.api.dto.ProjectSummaryDto;
import com.gergen.portal.api.dto.EpicDto;
import com.gergen.portal.api.dto.SprintDto;
import com.gergen.portal.api.dto.StoryDto;
import com.gergen.portal.domain.EpicStatus;
import com.gergen.portal.domain.MeetingType;
import com.gergen.portal.domain.ProjectApprovalState;
import com.gergen.portal.domain.ProjectStage;
import com.gergen.portal.domain.SprintStatus;
import com.gergen.portal.domain.StoryStage;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class PortalDataStore {
    private final Map<UUID, BusinessDto> businesses = new ConcurrentHashMap<>();
    private final Map<UUID, ProjectDetailDto> projects = new ConcurrentHashMap<>();

    private static final UUID SEED_BUSINESS_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID SEED_USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID SEED_PROJECT_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private static final UUID SEED_INVOICE_EPIC_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");
    private static final UUID SEED_DASHBOARD_EPIC_ID = UUID.fromString("55555555-5555-5555-5555-555555555555");
    private static final UUID SEED_SPRINT_ONE_ID = UUID.fromString("66666666-6666-6666-6666-666666666666");
    private static final UUID SEED_SPRINT_TWO_ID = UUID.fromString("77777777-7777-7777-7777-777777777777");

    public PortalDataStore() {
        seed();
    }

    private synchronized void seed() {
        if (!businesses.isEmpty()) {
            return;
        }
        BusinessDto business = new BusinessDto(SEED_BUSINESS_ID, "Acme Freight Logistics", SEED_USER_ID, Instant.now());
        businesses.put(business.getId(), cloneBusiness(business));

        ProjectDetailDto project = new ProjectDetailDto();
        project.setId(SEED_PROJECT_ID);
        project.setBusinessId(SEED_BUSINESS_ID);
        project.setName("Client Portal Modernization");
        project.setDescription("Replace the legacy portal with a single workflow for shippers and ops teams.");
        project.setStage(ProjectStage.PLANNING);
        project.setApprovalState(ProjectApprovalState.DRAFT);
        project.setKickoffCallAt(Instant.now().plus(5, ChronoUnit.DAYS));
        project.setUpdatedAt(Instant.now());
        project.setStatusNote("Epics drafted, backlog grooming underway.");

        List<EpicDto> epics = new ArrayList<>();
        EpicDto invoiceEpic = new EpicDto();
        invoiceEpic.setId(SEED_INVOICE_EPIC_ID);
        invoiceEpic.setProjectId(SEED_PROJECT_ID);
        invoiceEpic.setName("Invoice Workspace");
        invoiceEpic.setDescription("Create, approve, and sync invoices without leaving the portal.");
        invoiceEpic.setColor("#0ea5e9");
        invoiceEpic.setStatus(EpicStatus.PLANNED);
        invoiceEpic.setAcceptanceCriteria(List.of(
                "Ops can create draft invoices tied to shipments.",
                "Finance can approve + sync drafts to QuickBooks.",
                "Clients can download branded PDFs."));
        epics.add(invoiceEpic);

        EpicDto dashboardEpic = new EpicDto();
        dashboardEpic.setId(SEED_DASHBOARD_EPIC_ID);
        dashboardEpic.setProjectId(SEED_PROJECT_ID);
        dashboardEpic.setName("Operations Dashboard");
        dashboardEpic.setDescription("Surface live shipment health and automation alerts.");
        dashboardEpic.setColor("#f97316");
        dashboardEpic.setStatus(EpicStatus.IN_PROGRESS);
        dashboardEpic.setAcceptanceCriteria(List.of(
                "Single dashboard shows ETA risk, holds, escalations.",
                "Auto-notify ops when shipments miss SLA.",
                "Share filtered view with clients."));
        epics.add(dashboardEpic);

        List<StoryDto> stories = new ArrayList<>();
        StoryDto shipmentWidgets = new StoryDto();
        shipmentWidgets.setId(UUID.randomUUID());
        shipmentWidgets.setEpicId(SEED_DASHBOARD_EPIC_ID);
        shipmentWidgets.setProjectId(SEED_PROJECT_ID);
        shipmentWidgets.setTitle("Show live shipment health widgets");
        shipmentWidgets.setDescription(
                "Initial widget framework pulling data from the telemetry feed with placeholder visuals.");
        shipmentWidgets.setAcceptanceCriteria(List.of(
                "Display at least three widgets (ETA risk, holds, escalations).",
                "Pull data every 5 minutes from TMS feed."));
        shipmentWidgets.setStage(StoryStage.IN_PROGRESS);
        shipmentWidgets.setSprintId(SEED_SPRINT_TWO_ID);
        shipmentWidgets.setPoints(5);
        stories.add(shipmentWidgets);

        StoryDto financeApproval = new StoryDto();
        financeApproval.setId(UUID.randomUUID());
        financeApproval.setEpicId(SEED_INVOICE_EPIC_ID);
        financeApproval.setProjectId(SEED_PROJECT_ID);
        financeApproval.setTitle("Finance approval screen");
        financeApproval.setDescription("Internal approval experience for finance to act on draft invoices.");
        financeApproval.setAcceptanceCriteria(List.of(
                "Finance can view drafts, approve, reject.",
                "Audit trail stored on approval."));
        financeApproval.setStage(StoryStage.BACKLOG);
        financeApproval.setPoints(3);
        stories.add(financeApproval);

        List<SprintDto> sprints = new ArrayList<>();
        SprintDto sprintOne = new SprintDto();
        sprintOne.setId(SEED_SPRINT_ONE_ID);
        sprintOne.setProjectId(SEED_PROJECT_ID);
        sprintOne.setName("Sprint 1 • Intake Foundations");
        sprintOne.setGoal("Capture shipper inputs + unify account record.");
        sprintOne.setStartAt(Instant.now().minus(10, ChronoUnit.DAYS));
        sprintOne.setEndAt(Instant.now().minus(3, ChronoUnit.DAYS));
        sprintOne.setStatus(SprintStatus.COMPLETE);
        sprintOne.setNotes("Delivered admin intake and shipper self-serve forms.");
        sprints.add(sprintOne);

        SprintDto sprintTwo = new SprintDto();
        sprintTwo.setId(SEED_SPRINT_TWO_ID);
        sprintTwo.setProjectId(SEED_PROJECT_ID);
        sprintTwo.setName("Sprint 2 • Dashboard First Look");
        sprintTwo.setGoal("Ship first dashboard widgets + webhook plumbing.");
        sprintTwo.setStartAt(Instant.now().minus(2, ChronoUnit.DAYS));
        sprintTwo.setEndAt(Instant.now().plus(5, ChronoUnit.DAYS));
        sprintTwo.setStatus(SprintStatus.ACTIVE);
        sprints.add(sprintTwo);

        List<MeetingDto> meetings = new ArrayList<>();
        MeetingDto upcoming = new MeetingDto();
        upcoming.setId(UUID.randomUUID());
        upcoming.setProjectId(SEED_PROJECT_ID);
        upcoming.setStage(ProjectStage.REQUIREMENTS);
        upcoming.setScheduledAt(Instant.now().plus(3, ChronoUnit.DAYS));
        upcoming.setType(MeetingType.DISCOVERY);
        upcoming.setLocationUrl("https://meet.example.com/requirements");
        upcoming.setSummary("Logistics intake call: workflows + integrations");
        meetings.add(upcoming);

        MeetingDto recap = new MeetingDto();
        recap.setId(UUID.randomUUID());
        recap.setProjectId(SEED_PROJECT_ID);
        recap.setStage(ProjectStage.REQUIREMENTS);
        recap.setScheduledAt(Instant.now().minus(7, ChronoUnit.DAYS));
        recap.setType(MeetingType.REVIEW);
        recap.setLocationUrl("https://meet.example.com/kickoff-notes");
        recap.setSummary("Kickoff recap");
        recap.setNotes(
                "Discussed shipment lifecycle, existing TMS, and invoice approvals. Identified need for bi-directional sync with QuickBooks.");
        meetings.add(recap);

        project.setEpics(epics);
        project.setStories(stories);
        project.setSprints(sprints);
        project.setMeetings(meetings);

        projects.put(project.getId(), cloneProject(project));
    }

    public Optional<BusinessDto> findBusiness(UUID businessId) {
        BusinessDto business = businesses.get(businessId);
        return Optional.ofNullable(cloneBusiness(business));
    }

    public synchronized BusinessDto saveBusiness(BusinessDto business) {
        if (business.getId() == null) {
            business.setId(UUID.randomUUID());
        }
        businesses.put(business.getId(), cloneBusiness(business));
        return cloneBusiness(business);
    }

    public List<ProjectSummaryDto> listProjects(UUID businessId) {
        return projects.values().stream()
                .filter(p -> p.getBusinessId().equals(businessId))
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public Optional<ProjectDetailDto> findProject(UUID projectId) {
        return Optional.ofNullable(cloneProject(projects.get(projectId)));
    }

    public synchronized ProjectDetailDto saveProject(ProjectDetailDto project) {
        if (project.getId() == null) {
            project.setId(UUID.randomUUID());
        }
        project.setUpdatedAt(Instant.now());
        projects.put(project.getId(), cloneProject(project));
        return cloneProject(project);
    }

    private BusinessDto cloneBusiness(BusinessDto source) {
        if (source == null) {
            return null;
        }
        return new BusinessDto(source.getId(), source.getName(), source.getPrimaryContactUserId(),
                source.getCreatedAt());
    }

    private ProjectSummaryDto toSummary(ProjectDetailDto detail) {
        if (detail == null) {
            return null;
        }
        return new ProjectSummaryDto(
                detail.getId(),
                detail.getBusinessId(),
                detail.getName(),
                detail.getDescription(),
                detail.getStage(),
                detail.getApprovalState(),
                detail.getKickoffCallAt(),
                detail.getUpdatedAt(),
                detail.getStatusNote());
    }

    private ProjectDetailDto cloneProject(ProjectDetailDto source) {
        if (source == null) {
            return null;
        }
        ProjectDetailDto clone = new ProjectDetailDto();
        clone.setId(source.getId());
        clone.setBusinessId(source.getBusinessId());
        clone.setName(source.getName());
        clone.setDescription(source.getDescription());
        clone.setStage(source.getStage());
        clone.setApprovalState(source.getApprovalState());
        clone.setKickoffCallAt(source.getKickoffCallAt());
        clone.setUpdatedAt(source.getUpdatedAt());
        clone.setStatusNote(source.getStatusNote());
        clone.setEpics(
                source.getEpics().stream().map(this::cloneEpic).collect(Collectors.toCollection(ArrayList::new)));
        clone.setStories(
                source.getStories().stream().map(this::cloneStory).collect(Collectors.toCollection(ArrayList::new)));
        clone.setSprints(
                source.getSprints().stream().map(this::cloneSprint).collect(Collectors.toCollection(ArrayList::new)));
        clone.setMeetings(
                source.getMeetings().stream().map(this::cloneMeeting).collect(Collectors.toCollection(ArrayList::new)));
        return clone;
    }

    private EpicDto cloneEpic(EpicDto source) {
        if (source == null) {
            return null;
        }
        EpicDto clone = new EpicDto();
        clone.setId(source.getId());
        clone.setProjectId(source.getProjectId());
        clone.setName(source.getName());
        clone.setDescription(source.getDescription());
        clone.setColor(source.getColor());
        clone.setStatus(source.getStatus());
        clone.setAcceptanceCriteria(new ArrayList<>(source.getAcceptanceCriteria()));
        clone.setClientSummary(source.getClientSummary());
        return clone;
    }

    private StoryDto cloneStory(StoryDto source) {
        if (source == null) {
            return null;
        }
        StoryDto clone = new StoryDto();
        clone.setId(source.getId());
        clone.setEpicId(source.getEpicId());
        clone.setProjectId(source.getProjectId());
        clone.setTitle(source.getTitle());
        clone.setDescription(source.getDescription());
        clone.setAcceptanceCriteria(new ArrayList<>(source.getAcceptanceCriteria()));
        clone.setStage(source.getStage());
        clone.setSprintId(source.getSprintId());
        clone.setPoints(source.getPoints());
        clone.setPlanningOrder(source.getPlanningOrder());
        return clone;
    }

    private SprintDto cloneSprint(SprintDto source) {
        if (source == null) {
            return null;
        }
        SprintDto clone = new SprintDto();
        clone.setId(source.getId());
        clone.setProjectId(source.getProjectId());
        clone.setName(source.getName());
        clone.setGoal(source.getGoal());
        clone.setStartAt(source.getStartAt());
        clone.setEndAt(source.getEndAt());
        clone.setStatus(source.getStatus());
        clone.setNotes(source.getNotes());
        return clone;
    }

    private MeetingDto cloneMeeting(MeetingDto source) {
        if (source == null) {
            return null;
        }
        MeetingDto clone = new MeetingDto();
        clone.setId(source.getId());
        clone.setProjectId(source.getProjectId());
        clone.setStage(source.getStage());
        clone.setScheduledAt(source.getScheduledAt());
        clone.setType(source.getType());
        clone.setLocationUrl(source.getLocationUrl());
        clone.setSummary(source.getSummary());
        clone.setNotes(source.getNotes());
        return clone;
    }
}