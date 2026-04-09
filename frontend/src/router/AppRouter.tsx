import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage';
import DashboardPage from '../pages/user/DashboardPage';
import ProblemsPage from '../pages/user/ProblemsPage';
import RevisionQueuePage from '../pages/user/RevisionQueuePage';
import ScheduledProblemsPage from '../pages/user/ScheduledProblemsPage';
import BrowseBankPage from '../pages/user/BrowseBankPage';
import AddProblemPage from '../pages/user/AddProblemPage';
import SettingsPage from '../pages/user/SettingsPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminBankPage from '../pages/admin/AdminBankPage';
import AdminTopicsPage from '../pages/admin/AdminTopicsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AppShell from '../components/layout/AppShell';
import AdminLayout from '../pages/admin/AdminLayout';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/add" element={<AddProblemPage />} />
            <Route path="/revisions" element={<RevisionQueuePage />} />
            <Route path="/revisions/scheduled" element={<ScheduledProblemsPage />} />
            <Route path="/browse" element={<BrowseBankPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/bank" element={<AdminBankPage />} />
            <Route path="/admin/topics" element={<AdminTopicsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
