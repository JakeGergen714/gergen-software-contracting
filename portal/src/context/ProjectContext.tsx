import { useServices } from './ServiceContext';

export function useProject() {
  const { project } = useServices();
  return { projectService: project };
}
