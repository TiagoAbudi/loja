import React, { useState, useCallback, useEffect } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { GridColDef, GridActionsCellItem, GridRowParams, GridRenderCellParams } from '@mui/x-data-grid';
import { QueryData } from '@supabase/supabase-js';

import { supabase } from '../supabaseClient';
import { Database } from '../lib/database.types';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ContasAReceberFormDialog } from '../componets/ContasAReceberFormDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';

const contasQuery = supabase
    .from('contas_a_receber')
    .select(`*, cliente:Clientes ( id, nome )`);

type ContasComClienteArray = QueryData<typeof contasQuery>;

export type ContaComCliente = ContasComClienteArray[number];

export type ContaInsert = Database['public']['Tables']['contas_a_receber']['Insert'];


const ContasAReceberPage: React.FC = () => {
    const [contas, setContas] = useState<ContasComClienteArray>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingConta, setEditingConta] = useState<ContaComCliente | null>(null);

    const fetchContas = useCallback(async () => {
        setLoading(true);
        const { data, error } = await contasQuery.order('data_vencimento');

        if (error) {
            console.error('Erro ao buscar contas a receber:', error);
        } else {
            setContas(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchContas(); }, [fetchContas]);

    const handleOpenAddDialog = () => { setEditingConta(null); setDialogOpen(true); };
    const handleOpenEditDialog = (conta: ContaComCliente) => { setEditingConta(conta); setDialogOpen(true); };
    const handleCloseDialog = () => { setDialogOpen(false); setEditingConta(null); };

    const handleSaveConta = async (contaData: ContaInsert) => {
        const { error } = editingConta
            ? await supabase.from('contas_a_receber').update(contaData).eq('id', editingConta.id)
            : await supabase.from('contas_a_receber').insert([contaData]);

        if (error) console.error('Erro ao salvar conta:', error.message);
        else { handleCloseDialog(); fetchContas(); }
    };

    const handleMarkAsReceived = async (id: number) => {
        const { error } = await supabase.from('contas_a_receber').update({ status: 'Recebido', data_recebimento: new Date().toISOString() }).eq('id', id);
        if (error) console.error("Erro ao marcar como recebido:", error);
        else fetchContas();
    };

    const columns: GridColDef<ContaComCliente>[] = [
        { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 250 },
        {
            field: 'cliente',
            headerName: 'Cliente',
            minWidth: 200,
            renderCell: (params: GridRenderCellParams<ContaComCliente>) => params.row.cliente?.nome || 'N/A'
        },
        {
            field: 'valor',
            headerName: 'Valor (R$)',
            type: 'number',
            width: 130,
            valueFormatter: (value: number | null) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'data_vencimento',
            headerName: 'Vencimento',
            type: 'date',
            width: 130,
            valueGetter: (value) => value ? new Date(value) : null,
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
                <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenEditDialog(params.row)} />,
                <Tooltip title="Marcar como Recebida">
                    <span>
                        <GridActionsCellItem
                            icon={<CheckCircleIcon />}
                            label="Receber"
                            onClick={() => handleMarkAsReceived(params.row.id)}
                            disabled={params.row.status === 'Recebido'}
                        />
                    </span>
                </Tooltip>,
            ]
        }
    ];

    return (
        <Box>
            <CustomDataGrid title="Contas a Receber" rows={contas} columns={columns} loading={loading} onAdd={handleOpenAddDialog} />
            <ContasAReceberFormDialog open={dialogOpen} onClose={handleCloseDialog} onSave={handleSaveConta} initialData={editingConta} />
        </Box>
    );
};

export default ContasAReceberPage;