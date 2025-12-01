import { ExecutionAdminView } from '../../../components/project/stages/ExecutionAdminView';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';

export default function AdminProjectDelivery() {
  const { project } = useProjectWorkspace();
  return <ExecutionAdminView project={project} />;
}
