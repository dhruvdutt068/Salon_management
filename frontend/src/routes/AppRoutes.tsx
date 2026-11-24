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
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="join" element={<JoinQueuePage />} />
        <Route path="status/:id" element={<MyStatusPage />} />
        <Route path="reception" element={<ReceptionPage />} />
        <Route path="barber/:name" element={<BarberPage />} />
        <Route path="display" element={<DisplayPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
