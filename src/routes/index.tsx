// SEU NOVO ARQUIVO AppRoutes.tsx

import React from 'react';
// 1. Importações necessárias ATUALIZADAS
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
    Outlet,
} from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

// Imports das suas páginas (mantidos)
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
import FuncionariosPage from '../pages/FuncionariosPage'

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
    const router = createBrowserRouter(
        [
            {
                element: <ProtectedRoute session={session} />,
                children: [
                    { path: '/', element: <HomePage /> },
                    { path: '/produtos', element: <ProductsPage /> },
                    { path: '/clientes', element: <CustomersPage /> },
                    { path: '/contas-a-pagar', element: <ContasAPagarPage /> },
                    { path: '/contas-a-receber', element: <ContasAReceberPage /> },
                    { path: '/caixa', element: <CaixaPage /> },
                    { path: '/venda', element: <VendasPage /> }, // <- Sua página de vendas está aqui
                    { path: '/relatorio-vendas', element: <RelatorioVendasPage /> },
                    { path: '/relatorio-item-cliente', element: <RelatorioItensPorClientePage /> },
                    { path: '/relatorio-compras', element: <RelatorioComprasPage /> },
                    { path: '/fornecedores', element: <FornecedoresPage /> },
                    { path: '/entrada', element: <EntradaProdutosPage /> },
                    { path: '/relatorio-lucratividade', element: <RelatorioLucratividadePage /> },
                    { path: '/notas-fiscais', element: <NotasFiscaisPage /> },
                    { path: '/funcionarios', element: <FuncionariosPage /> },
                ],
            },

            {
                path: '/login',
                element: !session ? <LoginPage /> : <Navigate to="/" replace />,
            },
            {
                path: '/signup',
                element: !session ? <SignUpPage /> : <Navigate to="/" replace />,
            },
            {
                path: '/forgot-password',
                element: <ForgotPasswordPage />,
            },
            {
                path: '/update-password',
                element: <ResetPasswordPage />,
            },
        ],
        {
            basename: '/loja',
        }
    );

    return <RouterProvider router={router} />;
};