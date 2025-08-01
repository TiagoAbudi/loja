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
import ContasAPagarPage from '../pages/ContasAPagarPage';
import ContasAReceberPage from '../pages/ContasAReceberPage';
import CaixaPage from '../pages/CaixaPage';
import VendasPage from '../pages/VendasPage';
import RelatorioVendasPage from '../pages/RelatorioVendasPage';
import RelatorioItensPorClientePage from '../pages/RelatorioItensPorClientePage';
import RelatorioComprasPage from '../pages/RelatorioComprasPage';
import FornecedoresPage from '../pages/FornecedoresPage';
import EntradaProdutosPage from '../pages/EntradaProdutosPage';
import RelatorioLucratividadePage from '../pages/RelatorioLucratividadePage';
import NotasFiscaisPage from '../pages/NotasFiscaisPage';

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
                <Route path="/contas-a-pagar" element={<ProtectedRoute session={session} />}>
                    <Route index element={<ContasAPagarPage />} />
                </Route>
                <Route path="/contas-a-receber" element={<ProtectedRoute session={session} />}>
                    <Route index element={<ContasAReceberPage />} />
                </Route>
                <Route path="/caixa" element={<ProtectedRoute session={session} />}>
                    <Route index element={<CaixaPage />} />
                </Route>
                <Route path="/venda" element={<ProtectedRoute session={session} />}>
                    <Route index element={<VendasPage />} />
                </Route>
                <Route path="/relatorio-vendas" element={<ProtectedRoute session={session} />}>
                    <Route index element={<RelatorioVendasPage />} />
                </Route>
                <Route path="/relatorio-item-cliente" element={<ProtectedRoute session={session} />}>
                    <Route index element={<RelatorioItensPorClientePage />} />
                </Route>
                <Route path="/relatorio-compras" element={<ProtectedRoute session={session} />}>
                    <Route index element={<RelatorioComprasPage />} />
                </Route>
                <Route path="/fornecedores" element={<ProtectedRoute session={session} />}>
                    <Route index element={<FornecedoresPage />} />
                </Route>
                <Route path="/entrada" element={<ProtectedRoute session={session} />}>
                    <Route index element={<EntradaProdutosPage />} />
                </Route>
                <Route path="/relatorio-lucratividade" element={<ProtectedRoute session={session} />}>
                    <Route index element={<RelatorioLucratividadePage />} />
                </Route>
                  <Route path="/notas-fiscais" element={<ProtectedRoute session={session} />}>
                    <Route index element={<NotasFiscaisPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};