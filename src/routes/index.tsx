import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

import SignUpPage from '../pages/SignUpPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardLayout from '../componets/DashboardLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProductsPage from '../pages/ProductsPage';
import CustomersPage from '../pages/CustomersPage';

const ProtectedRoute = ({ session }: { session: Session | null }) => {
    if (!session) {
        return <Navigate to="/login" replace />;
    }
    return <DashboardLayout />;
};

interface AppRoutesProps {
    session: Session | null;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ session }) => {
    return (
        <BrowserRouter basename="/loja">
            <Routes>
                <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" replace />} />
                <Route path="/signup" element={!session ? <SignUpPage /> : <Navigate to="/" replace />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/update-password" element={<ResetPasswordPage />} />

                <Route path="/" element={<ProtectedRoute session={session} />}>
                    <Route index element={<HomePage />} />
                </Route>
                <Route path="/produtos" element={<ProtectedRoute session={session} />}>
                    <Route index element={<ProductsPage />} />
                </Route>
                <Route path="/clientes" element={<ProtectedRoute session={session} />}>
                    <Route index element={<CustomersPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};