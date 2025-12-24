import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Login from './pages/Login';
import BusinessDashboard from './pages/business/BusinessDashboard';
import BusinessWorkspaceLayout from './pages/business/BusinessWorkspaceLayout';
import BusinessProjectLayout from './pages/business/project/BusinessProjectLayout';
import BusinessProjectOverview from './pages/business/project/BusinessProjectOverview';
import BusinessProjectSchedule from './pages/business/project/BusinessProjectSchedule';
import BusinessProjectBacklog from './pages/business/project/BusinessProjectBacklog';
import BusinessProjectDelivery from './pages/business/project/BusinessProjectDelivery';
import BusinessProjectProposals from './pages/business/project/BusinessProjectProposals';
import BusinessProjectOps from './pages/business/project/BusinessProjectOps';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWorkspaceLayout from './pages/admin/AdminWorkspaceLayout';
import AdminProjectLayout from './pages/admin/project/AdminProjectLayout';
import AdminProjectOverview from './pages/admin/project/AdminProjectOverview';
import AdminProjectSchedule from './pages/admin/project/AdminProjectSchedule';
import AdminProjectBacklog from './pages/admin/project/AdminProjectBacklog';
import AdminProjectEpics from './pages/admin/project/AdminProjectEpics';
import AdminProjectProposals from './pages/admin/project/AdminProjectProposals';
import AdminProjectChangeRequests from './pages/admin/project/AdminProjectChangeRequests';
import { AdminProjectRisks } from './pages/admin/project/AdminProjectRisks';
import { AdminProjectDependencies } from './pages/admin/project/AdminProjectDependencies';
import { AdminProjectFinancials } from './pages/admin/project/AdminProjectFinancials';
import AdminProjectTickets from './pages/admin/project/AdminProjectTickets';
import AdminPortfolioDashboard from './pages/admin/AdminPortfolioDashboard';
import AdminProjectSprintLayout from './pages/admin/project/AdminProjectSprintLayout';
import AdminSprintPlanning from './pages/admin/project/AdminSprintPlanning';
import AdminSprintActive from './pages/admin/project/AdminSprintActive';
import AdminSettings from './pages/admin/AdminSettings';
import './index.css';
import { ServiceProvider } from './context/ServiceContext';
import { AuthProvider } from './context/AuthContext';
import { SiteLayout } from './components/layout/SiteLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ServiceProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path='/' element={<Navigate to='/login' replace />} />
                <Route path='/login' element={<Login />} />
                <Route path='*' element={<Navigate to='/login' replace />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path='/business' element={<BusinessWorkspaceLayout />}>
                  <Route index element={<Navigate to='projects' replace />} />
                  <Route path='projects' element={<BusinessDashboard />} />
                  <Route
                    path='projects/:projectId'
                    element={<BusinessProjectLayout />}
                  >
                    <Route index element={<Navigate to='overview' replace />} />
                    <Route
                      path='overview'
                      element={<BusinessProjectOverview />}
                    />
                    <Route
                      path='schedule'
                      element={<BusinessProjectSchedule />}
                    />
                    <Route
                      path='proposals'
                      element={<BusinessProjectProposals />}
                    />
                    <Route
                      path='backlog'
                      element={<BusinessProjectBacklog />}
                    />
                    <Route
                      path='delivery'
                      element={<BusinessProjectDelivery />}
                    />
                    <Route
                      path='proposals'
                      element={<BusinessProjectProposals />}
                    />
                    <Route path='ops' element={<BusinessProjectOps />} />
                  </Route>
                </Route>
                <Route path='/admin' element={<AdminWorkspaceLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route
                    path='portfolio'
                    element={<AdminPortfolioDashboard />}
                  />
                  <Route path='settings' element={<AdminSettings />} />
                  <Route
                    path='projects/:projectId'
                    element={<AdminProjectLayout />}
                  >
                    <Route index element={<Navigate to='overview' replace />} />
                    <Route path='overview' element={<AdminProjectOverview />} />
                    <Route path='schedule' element={<AdminProjectSchedule />} />
                    <Route path='epics' element={<AdminProjectEpics />} />
                    <Route
                      path='proposals'
                      element={<AdminProjectProposals />}
                    />
                    <Route
                      path='change-requests'
                      element={<AdminProjectChangeRequests />}
                    />
                    <Route path='risks' element={<AdminProjectRisks />} />
                    <Route
                      path='dependencies'
                      element={<AdminProjectDependencies />}
                    />
                    <Route
                      path='financials'
                      element={<AdminProjectFinancials />}
                    />
                    <Route path='tickets' element={<AdminProjectTickets />} />
                    <Route path='sprint' element={<AdminProjectSprintLayout />}>
                      <Route
                        index
                        element={<Navigate to='backlog' replace />}
                      />
                      <Route path='backlog' element={<AdminProjectBacklog />} />
                      <Route
                        path='planning'
                        element={<AdminSprintPlanning />}
                      />
                      <Route path='active' element={<AdminSprintActive />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ServiceProvider>
    </HelmetProvider>
  </StrictMode>
);
