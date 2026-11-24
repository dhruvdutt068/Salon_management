import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { HomePage } from '../pages/HomePage';
import { JoinQueuePage } from '../pages/JoinQueuePage';
import { MyStatusPage } from '../pages/MyStatusPage';
import { ReceptionPage } from '../pages/ReceptionPage';
import { BarberPage } from '../pages/BarberPage';
import { DisplayPage } from '../pages/DisplayPage';
import { AdminPage } from '../pages/AdminPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="status/:id" element={<MyStatusPage />} />
        <Route path="display" element={<DisplayPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* Protected Customer Route (Customer & Admin only) */}
        <Route
          path="join"
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <JoinQueuePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Receptionist Route (Receptionist & Admin) */}
        <Route
          path="reception"
          element={
            <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
              <ReceptionPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Barber Route (Barber & Admin) */}
        <Route
          path="barber/:name"
          element={
            <ProtectedRoute allowedRoles={['barber', 'admin']}>
              <BarberPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Owner/Admin Route (Admin only) */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
