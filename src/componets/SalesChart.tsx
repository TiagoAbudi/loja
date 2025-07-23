import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { Box } from '@mui/material';

interface SalesData {
    name: string;
    Vendas: number;
}

interface SalesChartProps {
    data: SalesData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    return (
        <Box sx={{ height: '90%', width: '100%', pt: 3 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value as number)} />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="Vendas" stroke="#1976d2" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};