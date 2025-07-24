// src/pages/ContasAReceberPage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
// 1. Importe o tipo GridRenderCellParams para usar no renderCell
import { GridColDef, GridActionsCellItem, GridRowParams, GridRenderCellParams } from '@mui/x-data-grid';
import { supabase } from '../supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ContasAReceberFormDialog } from '../componets/ContasAReceberFormDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';

// Interface base da conta
export interface ContaAReceber {
    id: number;
    descricao: string;
    valor: number;
    data_vencimento: string;
    data_recebimento?: string;
    status: 'Pendente' | 'Recebido' | 'Vencido';
    cliente_id: number;
}

// 2. Crie uma interface que representa a linha completa com o cliente aninhado
interface ContaComCliente extends ContaAReceber {
    cliente: {
        id: number;
        nome: string;
    } | null; // O cliente pode ser nulo se o join falhar
}

const ContasAReceberPage: React.FC = () => {
    // 3. Use o novo tipo no estado
    const [contas, setContas] = useState<ContaComCliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingConta, setEditingConta] = useState<ContaAReceber | null>(null);

    const fetchContas = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contas_a_receber')
            .select(`
                *,
                cliente:Clientes ( id, nome )
            `)
            .order('data_vencimento');

        if (error) {
            console.error('Erro ao buscar contas a receber:', error);
        } else {
            setContas(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchContas();
    }, [fetchContas]);

    const handleOpenAddDialog = () => {
        setEditingConta(null);
        setDialogOpen(true);
    };

    const handleOpenEditDialog = (conta: ContaAReceber) => {
        setEditingConta(conta);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingConta(null);
    };

    const handleSaveConta = async (contaData: Omit<ContaAReceber, 'id'>) => {
        let error;
        if (editingConta) {
            const { error: updateError } = await supabase.from('contas_a_receber').update(contaData).eq('id', editingConta.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('contas_a_receber').insert([contaData]);
            error = insertError;
        }

        if (error) {
            console.error('Erro ao salvar conta:', error.message);
        } else {
            handleCloseDialog();
            fetchContas();
        }
    };

    const handleMarkAsReceived = async (id: number) => {
        const { error } = await supabase
            .from('contas_a_receber')
            .update({ status: 'Recebido', data_pagamento: new Date().toISOString().slice(0, 10) })
            .eq('id', id);

        if (error) console.error("Erro ao marcar como recebido:", error);
        else fetchContas();
    };


    // 4. Use o novo tipo na definição das colunas
    const columns: GridColDef<ContaComCliente>[] = [
        { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 250 },
        {
            field: 'cliente',
            headerName: 'Cliente',
            minWidth: 200,
            // 5. Use renderCell para acessar o objeto aninhado de forma segura
            renderCell: (params: GridRenderCellParams<ContaComCliente>) => {
                // params.row é a linha inteira, agora com tipo forte!
                return params.row.cliente?.nome || 'N/A';
            }
        },
        {
            field: 'valor',
            headerName: 'Valor (R$)',
            type: 'number',
            width: 130,
            valueFormatter: (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'data_vencimento',
            headerName: 'Vencimento',
            type: 'date',
            width: 130,
            // CORREÇÃO AQUI
            valueGetter: (value: string | null) => {
                // 'value' é a string "YYYY-MM-DD" que vem do banco de dados
                if (!value) return null;

                // 1. Quebramos a string em partes: [2025, 07, 24]
                const [year, month, day] = value.split('-').map(Number);

                // 2. Criamos o objeto Date usando os componentes numéricos.
                // Isso força o JavaScript a usar o FUSO HORÁRIO LOCAL do navegador,
                // criando a data para meia-noite do dia 24 no Brasil.
                // O mês no construtor do Date é zero-indexado (0-11), por isso `month - 1`.
                return new Date(year, month - 1, day);
            },
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                const color = params.value === 'Recebido' ? 'success' : params.value === 'Vencido' ? 'error' : 'warning';
                return <Chip label={params.value} color={color} variant="outlined" size="small" />;
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 120,
            getActions: (params: GridRowParams<ContaComCliente>) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenEditDialog(params.row)}
                />,
                <Tooltip title="Marcar como Recebida">
                    <GridActionsCellItem
                        icon={<CheckCircleIcon />}
                        label="Receber"
                        onClick={() => handleMarkAsReceived(params.row.id)}
                        disabled={params.row.status === 'Recebido'}
                        color="default"
                    />
                </Tooltip>,
            ]
        }
    ];

    return (
        <Box>
            <CustomDataGrid
                title="Contas a Receber"
                rows={contas}
                columns={columns}
                loading={loading}
                onAdd={handleOpenAddDialog}
            />
            <ContasAReceberFormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveConta}
                initialData={editingConta}
            />
        </Box>
    );
};

export default ContasAReceberPage;