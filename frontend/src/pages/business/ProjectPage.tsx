import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useServices } from '../../context/ServiceContext';
import { ProjectDetail } from '../../types/domain';
import { ProjectStageHeader } from '../../components/project/ProjectStageHeader';
import { ProjectRoadmap } from '../../components/project/ProjectRoadmap';
import { ProjectMeetings } from '../../components/project/ProjectMeetings';
import { ProjectSprints } from '../../components/project/ProjectSprints';
import { RequirementsClientView } from '../../components/project/stages/RequirementsClientView';
import { PlanningClientView } from '../../components/project/stages/PlanningClientView';
import { ExecutionClientView } from '../../components/project/stages/ExecutionClientView';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project: projectService } = useServices();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let mounted = true;
    setLoading(true);
    projectService
      .getProject(projectId)
      .then((data) => {
        if (mounted) setProject(data);
      })
      .catch(() => {
        navigate('/business');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [navigate, projectId, projectService]);

  if (loading || !project) {
    return (
      <div
        className='min-h-[70vh] flex items-center justify-center text-slate-500'
        data-testid='business-project-loading'
      >
        Loading project…
      </div>
    );
  }

  return (
    <div className='bg-slate-50 py-10' data-testid='business-project-page'>
      <Helmet>
        <title>{project.name} | Project workspace</title>
      </Helmet>
      <div className='max-w-6xl mx-auto px-4 space-y-8'>
        <ProjectStageHeader project={project} />
        {project.stage === 'REQUIREMENTS' ? (
          <RequirementsClientView project={project} />
        ) : project.stage === 'PLANNING' ? (
          <PlanningClientView project={project} />
        ) : project.stage === 'EXECUTION' ? (
          <ExecutionClientView project={project} />
        ) : (
          <>
            <section className='grid lg:grid-cols-2 gap-6'>
              <div data-testid='business-project-roadmap'>
                <ProjectRoadmap project={project} />
              </div>
              <div data-testid='business-project-meetings'>
                <ProjectMeetings meetings={project.meetings} />
              </div>
            </section>
            <div data-testid='business-project-sprints'>
              <ProjectSprints sprints={project.sprints} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
