import { AuthService, KeycloakAuthService } from './AuthService';
import { ApiBusinessService, BusinessService } from './BusinessService';
import { ApiProjectService, ProjectService } from './ProjectService';
import { ApiTagService, TagService } from './TagService';
import { ApiDocumentService, DocumentService } from './DocumentService';
import { ApiAuditService, AuditService } from './AuditService';
import { ApiProposalService, ProposalService } from './ProposalService';
import { ApiReportService, ReportService } from './ReportService';
import { ApiSearchService, SearchService } from './SearchService';
import { ApiNotificationService, NotificationService } from './NotificationService';
import { ApiUserService, UserService } from './UserService';
import { HttpClient } from './httpClient';
import { appConfig } from '../config';

export interface ServiceRegistry {
  auth: AuthService;
  business: BusinessService;
  project: ProjectService;
  tags: TagService;
  documents: DocumentService;
  audit: AuditService;
  proposals: ProposalService;
  reports: ReportService;
  search: SearchService;
  notifications: NotificationService;
  users: UserService;
}

const auth = new KeycloakAuthService();
const client = new HttpClient(appConfig.apiBaseUrl, () => auth.getAccessToken());

export const services: ServiceRegistry = {
  auth,
  business: new ApiBusinessService(client),
  project: new ApiProjectService(client),
  tags: new ApiTagService(client),
  documents: new ApiDocumentService(client),
  audit: new ApiAuditService(client),
  proposals: new ApiProposalService(client),
  reports: new ApiReportService(client),
  search: new ApiSearchService(client),
  notifications: new ApiNotificationService(client),
  users: new ApiUserService(client),
};
