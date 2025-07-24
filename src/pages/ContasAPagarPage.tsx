// src/pages/ContasAPagarPage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { GridColDef, GridActionsCellItem, GridRowParams, GridRenderCellParams } from '@mui/x-data-grid';
import { supabase } from '../supabaseClient';
import { CustomDataGrid } from '../componets/CustomDataGrid';
import { ContasAPagarFormDialog } from '../componets/ContasAPagarFormDialog';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface ContaAPagar {
    id: number;
    descricao: string;
    valor: number;
    data_vencimento: string;
    data_pagamento?: string;
    status: 'Pendente' | 'Pago' | 'Vencido';
    fornecedor_id?: number;
}

export interface ContaComFornecedor extends ContaAPagar {
    fornecedores: {
        id: number;
        nome_fantasia: string;
    } | null;
}

const ContasAPagarPage: React.FC = () => {
    const [contas, setContas] = useState<ContaComFornecedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingConta, setEditingConta] = useState<ContaComFornecedor | null>(null);

    const fetchContas = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contas_a_pagar')
            .select(`*, fornecedores ( id, nome_fantasia )`)
            .order('data_vencimento');

        if (error) {
            console.error('Erro ao buscar contas a pagar:', error);
        } else {
            setContas(data as ContaComFornecedor[]);
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

    const handleOpenEditDialog = (conta: ContaComFornecedor) => {
        setEditingConta(conta);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingConta(null);
        setDialogOpen(false);
    };

    const handleSaveConta = async (contaData: Omit<ContaAPagar, 'id'>) => {
        // --- INÍCIO DA CORREÇÃO DEFINITIVA DE DATA E STATUS ---

        // 1. Converte a string de data (ex: "2025-07-25") para um objeto Date UTC explícito.
        // Isso garante que a data seja tratada como meia-noite do dia correto, sem influência do fuso horário local.
        const parts = contaData.data_vencimento.split('-').map(Number);
        const dataVencimentoUTC = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

        // 2. Prepara o objeto de dados final para ser salvo no banco.
        const dadosParaSalvar = {
            ...contaData,
            // Enviamos a data no formato ISO completo. O Supabase/PostgreSQL saberá como lidar com isso.
            data_vencimento: dataVencimentoUTC.toISOString(),
        };

        // 3. Verifica o status (lógica que já tínhamos, mas agora usando a data UTC).
        const hoje = new Date();
        hoje.setUTCHours(0, 0, 0, 0); // Compara com o início do dia em UTC

        if (dataVencimentoUTC < hoje && dadosParaSalvar.status === 'Pendente') {
            dadosParaSalvar.status = 'Vencido';
        }
        // --- FIM DA CORREÇÃO ---


        let error;
        if (editingConta) {
            // Usa o objeto com a data corrigida no update
            const { error: updateError } = await supabase.from('contas_a_pagar').update(dadosParaSalvar).eq('id', editingConta.id);
            error = updateError;
        } else {
            // Usa o objeto com a data corrigida no insert
            const { error: insertError } = await supabase.from('contas_a_pagar').insert([dadosParaSalvar]);
            error = insertError;
        }

        if (error) {
            console.error('Erro ao salvar conta:', error.message);
        } else {
            handleCloseDialog();
            fetchContas();
        }
    };

    const handleMarkAsPaid = async (id: number) => {
        const { error } = await supabase
            .from('contas_a_pagar')
            .update({ status: 'Pago', data_pagamento: new Date().toISOString().slice(0, 10) })
            .eq('id', id);

        if (error) console.error("Erro ao marcar como pago:", error);
        else fetchContas();
    };

    const columns: GridColDef<ContaComFornecedor>[] = [
        { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 250 },
        {
            field: 'fornecedor',
            headerName: 'Fornecedor',
            minWidth: 200,
            renderCell: (params: GridRenderCellParams<ContaComFornecedor>) => {
                return params.row.fornecedores?.nome_fantasia || 'N/A';
            }
        },
        {
            field: 'valor',
            headerName: 'Valor (R$)',
            type: 'number',
            width: 130,
            valueFormatter: (value) => (value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
                const color = params.value === 'Pago' ? 'success' : params.value === 'Vencido' ? 'error' : 'warning';
                return <Chip label={params.value} color={color as any} variant="outlined" size="small" />;
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 120,
            getActions: (params: GridRowParams<ContaComFornecedor>) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenEditDialog(params.row)}
                />,
                <Tooltip title="Marcar como Paga">
                    <GridActionsCellItem
                        icon={<CheckCircleIcon />}
                        label="Pagar"
                        onClick={() => handleMarkAsPaid(params.row.id)}
                        disabled={params.row.status === 'Pago'}
                        color="default"
                    />
                </Tooltip>,
            ]
        }
    ];

    return (
        <Box>
            <CustomDataGrid
                title="Contas a Pagar"
                rows={contas}
                columns={columns}
                loading={loading}
                onAdd={handleOpenAddDialog}
            />
            <ContasAPagarFormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveConta}
                initialData={editingConta}
            />
        </Box>
    );
};

export default ContasAPagarPage;