import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { QueryData } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FornecedorFormDialog } from '../componets/FornecedorFormDialog';
import { ConfirmationDialog } from '../componets/ConfirmationDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';

const fornecedoresQuery = supabase.from('fornecedores').select('*');
type Fornecedores = QueryData<typeof fornecedoresQuery>;
export type Fornecedor = Fornecedores[number];

const FornecedoresPage: React.FC = () => {
    const [fornecedores, setFornecedores] = useState<Fornecedores>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [fornecedorToDelete, setFornecedorToDelete] = useState<number | null>(null);

    const fetchFornecedores = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('fornecedores').select('*').order('nome_fantasia');
        if (error) {
            console.error('Erro ao buscar fornecedores:', error);
        } else {
            setFornecedores(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchFornecedores(); }, [fetchFornecedores]);

    const handleOpenAddDialog = () => {
        setEditingFornecedor(null);
        setDialogOpen(true);
    };

    const handleOpenEditDialog = (fornecedor: Fornecedor) => {
        setEditingFornecedor(fornecedor);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingFornecedor(null);
    };

    const handleSaveFornecedor = async (fornecedorData: Omit<Fornecedor, 'id' | 'created_at'>) => {
        let error;
        if (editingFornecedor) {
            ({ error } = await supabase.from('fornecedores').update(fornecedorData).eq('id', editingFornecedor.id));
        } else {
            ({ error } = await supabase.from('fornecedores').insert([fornecedorData]));
        }
        if (error) {
            console.error('Erro ao salvar fornecedor:', error.message);
        } else {
            handleCloseDialog();
            fetchFornecedores();
        }
    };

    const handleOpenConfirmDialog = (id: number) => {
        setFornecedorToDelete(id);
        setConfirmOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmOpen(false);
        setFornecedorToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (fornecedorToDelete) {
            const { error } = await supabase.from('fornecedores').delete().eq('id', fornecedorToDelete);
            if (error) {
                console.error('Erro ao deletar fornecedor:', error.message);
            } else {
                fetchFornecedores();
            }
        }
        handleCloseConfirmDialog();
    };

    const columns: GridColDef<Fornecedor>[] = [
        { field: 'nome_fantasia', headerName: 'Nome Fantasia', flex: 1, minWidth: 200 },
        { field: 'razao_social', headerName: 'Razão Social', flex: 1, minWidth: 200 },
        {
            field: 'cnpj',
            headerName: 'CNPJ',
            width: 180,
            valueFormatter: (value: string | null) => {
                if (!value) return '';
                const cleaned = value.replace(/\D/g, '');
                if (cleaned.length !== 14) return value;
                return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }
        },
        { field: 'telefone', headerName: 'Telefone', width: 150 },
        { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 200 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 100,
            getActions: (params: GridRowParams<Fornecedor>) => [
                <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenEditDialog(params.row)} />,
                <GridActionsCellItem icon={<DeleteIcon />} label="Deletar" onClick={() => handleOpenConfirmDialog(params.row.id)} color="inherit" />,
            ],
        },
    ];

    return (
        <Box>
            <CustomDataGrid
                title="Fornecedores"
                rows={fornecedores}
                columns={columns}
                loading={loading}
                onAdd={handleOpenAddDialog}
            />
            <FornecedorFormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveFornecedor}
                initialData={editingFornecedor}
            />
            <ConfirmationDialog
                open={confirmOpen}
                onClose={handleCloseConfirmDialog}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita."
            />
        </Box>
    );
};

export default FornecedoresPage;