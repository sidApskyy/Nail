import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppRoot } from './root';
import { ProtectedRoute } from './ProtectedRoute';

import { LoginPage } from '../pages/LoginPage';

import { AdminLayout } from '../layouts/AdminLayout';
import { StaffLayout } from '../layouts/StaffLayout';

import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';
import { ManageUsersPage } from '../pages/admin/ManageUsersPage';
import { AdminAppointmentsPage } from '../pages/admin/AdminAppointmentsPage';
import { CompletedWorksPage } from '../pages/admin/CompletedWorksPage';
import { ActivityLogsPage } from '../pages/admin/ActivityLogsPage';

import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage';
import { CreateAppointmentPage } from '../pages/staff/CreateAppointmentPage';
import { MyAppointmentsPage } from '../pages/staff/MyAppointmentsPage';
import { UploadWorkPage } from '../pages/staff/UploadWorkPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppRoot />,
    children: [
      { path: '/login', element: <LoginPage /> },

      {
        element: <ProtectedRoute allowRoles={['admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: '/admin/analytics', element: <AnalyticsPage /> },
              { path: '/admin/users', element: <ManageUsersPage /> },
              { path: '/admin/appointments', element: <AdminAppointmentsPage /> },
              { path: '/admin/completed-works', element: <CompletedWorksPage /> },
              { path: '/admin/activity-logs', element: <ActivityLogsPage /> }
            ]
          }
        ]
      },

      {
        element: <ProtectedRoute allowRoles={['staff']} />,
        children: [
          {
            element: <StaffLayout />,
            children: [
              { path: '/staff', element: <StaffDashboardPage /> },
              { path: '/staff/create-appointment', element: <CreateAppointmentPage /> },
              { path: '/staff/my-appointments', element: <MyAppointmentsPage /> },
              { path: '/staff/upload-work', element: <UploadWorkPage /> }
            ]
          }
        ]
      }
    ]
  }
]);
