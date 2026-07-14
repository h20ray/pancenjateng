import { AuthRouting } from '@/auth/auth-routing';
import { RequireAuth } from '@/auth/require-auth';
import { AdminLayout } from '@/layouts/admin/layout';
import { PublicLayout } from '@/layouts/public/layout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminAduanListPage } from '@/pages/admin/AdminAduanListPage';
import { AdminAduanDetailPage } from '@/pages/admin/AdminAduanDetailPage';
import { WizardFormPage } from '@/pages/public/WizardFormPage';
import { SuccessPage } from '@/pages/public/SuccessPage';
import { TrackingPage } from '@/pages/public/TrackingPage';
import { Navigate, Route, Routes } from 'react-router';

export function AppRoutingSetup() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/lapor" element={<WizardFormPage />} />
        <Route path="/lapor/berhasil/:ticket" element={<SuccessPage />} />
        <Route path="/lacak" element={<TrackingPage />} />
      </Route>

      {/* Auth routes */}
      <Route path="auth/*" element={<AuthRouting />} />

      {/* Admin routes (protected) */}
      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/aduan" element={<AdminAduanListPage />} />
          <Route path="/admin/aduan/:id" element={<AdminAduanDetailPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="/" element={<Navigate to="/lapor" replace />} />
      <Route path="*" element={<Navigate to="/lapor" replace />} />
    </Routes>
  );
}
