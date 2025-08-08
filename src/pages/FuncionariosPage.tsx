import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Chip,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    GridColDef,
    GridActionsCellItem,
    GridRowParams
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { supabase } from '../supabaseClient';
import { FuncionarioFormDialog } from '../componets/FuncionarioFormDialog';
import { ConfirmationDialog } from '../componets/ConfirmationDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';
import { DialogImportData } from '../componets/DialogImportData';

export interface Funcionario {
    id: number;
    created_at: string | null;
    nome: string;
    cargo: string | null;
    data_admissao: string | null;
    status: string;
    credito: number;
}

export const FuncionariosPage: React.FC = () => {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [funcionarioToDelete, setFuncionarioToDelete] = useState<number | null>(null);
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    const columns: GridColDef<Funcionario>[] = [
        { field: 'id', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
        { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 250 },
        { field: 'cargo', headerName: 'Cargo', width: 180 },
        {
            field: 'credito',
            headerName: 'Crédito',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value: number | null) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (<Chip label={params.value} color={params.value === 'Ativo' ? 'success' : 'error'} variant="outlined" size="small" />),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 120,
            getActions: (params: GridRowParams<Funcionario>) => [
                <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(params.row)} />,
                <GridActionsCellItem icon={<DeleteIcon />} label="Deletar" onClick={() => handleOpenConfirmDialog(params.row.id)} />,
                <Tooltip title={params.row.status === 'Ativo' ? 'Desativar' : 'Ativar'}>
                    <IconButton onClick={() => handleToggleStatus(params.row)}>
                        {params.row.status === 'Ativo' ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                    </IconButton>
                </Tooltip>
            ],
        },
    ];

    const fetchFuncionarios = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('funcionarios')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error("Erro ao buscar funcionários:", error);
            setFuncionarios([]);
        } else if (data) {
            setFuncionarios(data);
        }
        setLoading(false);
    }, []);

    const handleOpenDialog = (funcionario: Funcionario | null = null) => {
        setEditingFuncionario(funcionario);
        setDialogOpen(true);
    };

    const handleOpenImportDialog = () => {
        setImportDialogOpen(true);
    };

    const handleCloseDialogs = () => {
        setDialogOpen(false);
        setEditingFuncionario(null);
        setImportDialogOpen(false);
        setConfirmOpen(false);
    };

    const handleSaveFuncionario = useCallback(async (formData: Partial<Funcionario> & { email?: string; senha?: string }) => {
        if (!formData.nome || formData.nome.trim() === '') {
            alert('O nome do funcionário é obrigatório.');
            return;
        }

        let error: any = null;

        if (formData.id) {
            const { id, ...updateData } = formData;
            const { error: updateError } = await supabase.from('funcionarios').update(updateData).eq('id', id);
            error = updateError;
        } else {
            if (!formData.email || !formData.senha) {
                alert('E-mail e Senha são obrigatórios para criar um novo funcionário.');
                return;
            }

            const { data, error: invokeError } = await supabase.functions.invoke('criar_usuario_funcionario', {
                body: { funcionarioData: formData },
            });

            if (data?.error) {
                error = data.error;
            } else if (invokeError) {
                error = invokeError;
            }
        }

        if (error) {
            console.error('Erro ao salvar funcionário:', error);
            const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? error.message : String(error);
            alert("Erro ao salvar: " + errorMessage);
        } else {
            handleCloseDialogs();
            fetchFuncionarios();
        }
    }, [fetchFuncionarios]);


    const handleOpenConfirmDialog = (id: number) => {
        setFuncionarioToDelete(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = useCallback(async () => {
        if (funcionarioToDelete) {
            const { error } = await supabase.from('funcionarios').delete().eq('id', funcionarioToDelete);
            if (error) { console.error('Erro ao deletar funcionário:', error.message); }
            else { fetchFuncionarios(); }
        }
        handleCloseDialogs();
    }, [funcionarioToDelete, fetchFuncionarios]);

    const handleToggleStatus = useCallback(async (funcionario: Funcionario) => {
        const newStatus = funcionario.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const { error } = await supabase.from('funcionarios').update({ status: newStatus }).eq('id', funcionario.id);
        if (error) {
            console.error('Erro ao alterar status:', error.message);
        } else {
            fetchFuncionarios();
        }
    }, [fetchFuncionarios]);

    const mapearDadosFuncionario = (row: any) => {
        if (!row['Nome']) return null;
        return {
            nome: row['Nome'],
            cargo: row['Cargo'],
            status: row['Status'] || 'Ativo',
            credito: parseFloat(row['Crédito']) || 0,
        };
    };

    const CABECALHOS_FUNCIONARIOS = "Nome,Cargo,Status,Crédito";
    const EXEMPLO_LINHA_FUNCIONARIOS = `João da Silva,Vendedor,Ativo,50.00`;

    useEffect(() => {
        fetchFuncionarios();
    }, [fetchFuncionarios]);

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
            <CustomDataGrid
                title="Funcionários"
                rows={funcionarios}
                columns={columns}
                loading={loading}
                onAdd={() => handleOpenDialog()}
                onImport={handleOpenImportDialog}
            />

            <FuncionarioFormDialog
                open={dialogOpen}
                onClose={handleCloseDialogs}
                onSave={handleSaveFuncionario}
                funcionario={editingFuncionario}
            />

            <ConfirmationDialog
                open={confirmOpen}
                onClose={handleCloseDialogs}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza de que deseja excluir este funcionário? Esta ação não pode ser desfeita."
            />

            <DialogImportData
                open={importDialogOpen}
                onClose={handleCloseDialogs}
                title='Funcionários'
                tableName='funcionarios'
                csvExemplo={CABECALHOS_FUNCIONARIOS}
                exemploLinhaCsv={EXEMPLO_LINHA_FUNCIONARIOS}
                mapeamentoColunas={mapearDadosFuncionario}
                onImportSuccess={() => {
                    fetchFuncionarios();
                    handleCloseDialogs();
                }}
            />
        </Box>
    );
};

export default FuncionariosPage;